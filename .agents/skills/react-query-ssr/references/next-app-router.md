# Next.js App Router Patterns

Use these templates when implementing TanStack Query SSR in App Router.

## 1. Query Module

```ts
import { queryOptions } from "@tanstack/react-query"

import type { PublicPageResponse } from "@/lib/api/types"
import { createApiClient } from "@/lib/api/client"

export async function fetchPublicPage(slug: string): Promise<PublicPageResponse | null> {
  const api = createApiClient()
  const { data } = await api.GET("/api/pages/{slug}", {
    params: { path: { slug } },
  })

  return data ?? null
}

export function publicPageQueryKey(slug: string) {
  return ["public-page", slug] as const
}

export function publicPageQueryOptions(slug: string) {
  return queryOptions({
    queryKey: publicPageQueryKey(slug),
    queryFn: () => fetchPublicPage(slug),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  })
}
```

## 2. Server Route with Hydration

```tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"

import { PublicPageClient } from "@/components/public/public-page-client"
import { publicPageQueryOptions } from "@/lib/public/query"

export default async function HandlePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const queryClient = new QueryClient()

  const page = await queryClient.fetchQuery(publicPageQueryOptions(handle))

  if (!page) {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicPageClient handle={handle} />
    </HydrationBoundary>
  )
}
```

## 3. Client Consumer

```tsx
"use client"

import { useQuery } from "@tanstack/react-query"

import { publicPageQueryOptions } from "@/lib/public/query"

export function PublicPageClient({ handle }: { handle: string }) {
  const { data, error, isPending } = useQuery({
    ...publicPageQueryOptions(handle),
    retry: false,
  })

  if (isPending && !data) {
    return <p>Loading...</p>
  }

  if (!data) {
    return <p>{error instanceof Error ? error.message : "Unable to load page."}</p>
  }

  return <main>{data.title}</main>
}
```

## 4. Metadata + Page Dedupe

When `generateMetadata` and page render fetch the same resource in one request, wrap the fetcher with `cache(...)` and call that cached function from both places.

```tsx
import { cache } from "react"

const getPublicPage = cache(async (slug: string) => fetchPublicPage(slug))
```

Then override `queryFn` server-side when needed:

```tsx
await queryClient.fetchQuery({
  ...publicPageQueryOptions(slug),
  queryFn: () => getPublicPage(slug),
})
```
