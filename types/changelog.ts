export type ChangelogEntry = {
  locale?: string
  version: string
  date: Date
  title?: string
  tags?: string
  // Compiled MDX body (build-time compiled via @next/mdx — see lib/content.ts)
  Component?: import('react').ComponentType
  metadata: {
    [key: string]: any
  },
}
