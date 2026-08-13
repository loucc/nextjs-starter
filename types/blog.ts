
export type BlogPost = {
  locale?: string
  title: string
  description?: string
  image?: string
  slug: string
  tags?: string
  date: Date
  visible?: 'draft' | 'invisible' | 'published'
  pin?: boolean
  // Compiled MDX component (build-time compiled via @next/mdx — see lib/content.ts)
  Component?: import('react').ComponentType
  metadata: {
    [key: string]: any
  },
}
