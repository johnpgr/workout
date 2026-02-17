# Troubleshooting

## Symptom: `notFound()` triggers on backend outage

Cause:
- Using `prefetchQuery` + `getQueryData` and treating missing cache as not-found.

Fix:
- Use `fetchQuery` (or `ensureQueryData`) when route logic depends on returned data.
- Map domain not-found (`null`/404) separately from thrown network/server errors.

## Symptom: Query refetches immediately after hydration

Cause:
- `staleTime` is zero or too low.

Fix:
- Set a route-appropriate `staleTime` in shared query options.

## Symptom: Client does a second request with seemingly same key

Cause:
- Server and client keys differ in shape, type, or parameter values.

Fix:
- Export one `queryKey` helper and reuse everywhere.
- Avoid inline key objects built differently in server/client codepaths.

## Symptom: Duplicate fetch in `generateMetadata` and page

Cause:
- Two independent server fetches in one request.

Fix:
- Wrap fetcher with React `cache(...)` and reuse it in both metadata and page SSR fetch.

## Symptom: Unauthorized behavior is mixed with generic errors

Cause:
- All errors are collapsed into one message.

Fix:
- Raise typed errors with status metadata.
- Branch UI/control flow for 401 vs generic failures.

## Symptom: Hydration state is empty

Cause:
- Data fetched with one `QueryClient` and dehydrated from another.

Fix:
- Create one request-scoped `QueryClient` and dehydrate that same instance.

## Minimal Debug Checklist
- Log query key on server and client.
- Confirm `fetchQuery` executes before `dehydrate(queryClient)`.
- Confirm `HydrationBoundary` wraps the subtree that runs `useQuery`.
- Confirm query module exports are shared, not duplicated.
