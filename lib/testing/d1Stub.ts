// ---------------------------------------------------------------------------
// Minimal D1 fake for vitest. Lib code talks to D1 via
// prepare(sql).bind(...).first()/all()/run() and db.batch(...) — this stub
// implements exactly that surface, with per-test results keyed by SQL
// substring, and records every prepared statement for assertions.
// ---------------------------------------------------------------------------

import type { D1Database } from "@cloudflare/workers-types";
import { vi } from "vitest";

export interface StubConfig {
  /** Map from SQL substring to the rows returned by first()/all(). */
  rows?: Record<string, Record<string, unknown>[]>;
  /** Map from SQL substring to the meta returned by run() (default 1 change). */
  run?: Record<string, { changes?: number }>;
  /** Result returned by db.batch() (default: one success entry per statement). */
  batchResult?: unknown[];
}

export interface D1Stub {
  db: D1Database;
  /** Every prepared statement in call order: { sql, args }. */
  statements: { sql: string; args: unknown[] }[];
  /** Statements passed to db.batch() in call order. */
  batchStatements: { sql: string }[];
}

export function createD1Stub(config: StubConfig = {}): D1Stub {
  const statements: { sql: string; args: unknown[] }[] = [];
  const batchStatements: { sql: string }[] = [];

  function rowsFor(sql: string): Record<string, unknown>[] {
    const key = Object.keys(config.rows ?? {}).find((k) => sql.includes(k));
    return key ? config.rows![key] : [];
  }

  function makeStatement(sql: string) {
    const statement: Record<string, unknown> = {
      sql,
      bind: vi.fn((...args: unknown[]) => {
        statements.push({ sql, args });
        return statement;
      }),
      first: vi.fn(async () => rowsFor(sql)[0] ?? null),
      all: vi.fn(async () => ({ success: true, results: rowsFor(sql) })),
      run: vi.fn(async () => {
        const key = Object.keys(config.run ?? {}).find((k) => sql.includes(k));
        const changes = key ? (config.run![key].changes ?? 1) : 1;
        return { success: true, meta: { changes } };
      }),
    };
    return statement;
  }

  const db = {
    prepare: vi.fn((sql: string) => makeStatement(sql)),
    batch: vi.fn(async (stmts: Array<{ sql: string }>) => {
      batchStatements.push(...stmts.map((s) => ({ sql: s.sql })));
      return config.batchResult ?? stmts.map(() => ({ success: true }));
    }),
  } as unknown as D1Database;

  return { db, statements, batchStatements };
}
