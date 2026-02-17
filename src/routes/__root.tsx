import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import { SyncRuntimeBridge } from "@/components/sync-runtime-bridge"
import { AuthProvider } from "@/lib/auth-context"
import appCss from "@/index.css?url"

const queryClient = new QueryClient()

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Workout OS",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/vite.svg",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootProviders,
  errorComponent: RootErrorBoundary,
})

function RootProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SyncRuntimeBridge />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorBoundary({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Erro inesperado."

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
      <section className="w-full space-y-2">
        <h1 className="text-lg font-semibold">Erro</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </section>
    </main>
  )
}
