import { afterEach, describe, expect, it, vi } from "vitest";
import { getShowcaseItems } from "./showcase";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

function setMockDB(results: unknown[]) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = {
    env: {
      DB: {
        prepare: () => ({
          all: async () => ({ results }),
        }),
      },
    },
  };
}

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
});

describe("getShowcaseItems", () => {
  it("falls back to seed items when there is no Cloudflare context", async () => {
    const items = await getShowcaseItems();
    expect(items.length).toBe(15);
    expect(items[0]).toEqual({
      name: "Happy Horse 2",
      url: "https://happyhorse2.com/",
    });
  });

  it("returns items from D1 when the binding is available", async () => {
    setMockDB([
      { name: "From D1", url: "https://from-d1.example/" },
      { name: "Also D1", url: "https://also-d1.example/" },
    ]);
    const items = await getShowcaseItems();
    expect(items).toEqual([
      { name: "From D1", url: "https://from-d1.example/" },
      { name: "Also D1", url: "https://also-d1.example/" },
    ]);
  });

  it("falls back to seeds when the D1 query throws", async () => {
    setMockDB([]);
    (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = {
      env: {
        DB: {
          prepare: () => ({
            all: async () => {
              throw new Error("boom");
            },
          }),
        },
      },
    };
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const items = await getShowcaseItems();
    expect(items.length).toBe(15);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
