import { useSyncExternalStore, type PropsWithChildren } from "react"
import type { User } from "@supabase/supabase-js"
import { AuthContext } from "./store"
import { scheduleSync } from "@/lib/sync"
import { supabase } from "@/lib/supabase"

interface AuthSnapshot {
  user: User | null
  isLoading: boolean
}

let snapshot: AuthSnapshot = {
  user: null,
  isLoading: true,
}

let activeSubscribers = 0
let stopAuthRuntime: (() => void) | null = null
const listeners = new Set<() => void>()

function getAuthSnapshot(): AuthSnapshot {
  return snapshot
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function updateSnapshot(patch: Partial<AuthSnapshot>) {
  snapshot = {
    ...snapshot,
    ...patch,
  }
  emitChange()
}

function startAuthRuntime() {
  let active = true

  void supabase.auth.getSession().then(({ data: { session } }) => {
    if (!active) {
      return
    }

    updateSnapshot({
      user: session?.user ?? null,
      isLoading: false,
    })

    if (session?.user) {
      scheduleSync("auth")
    }
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    updateSnapshot({
      user: session?.user ?? null,
      isLoading: false,
    })

    if (session?.user) {
      scheduleSync("auth")
    }
  })

  return () => {
    active = false
    subscription.unsubscribe()
  }
}

function subscribeAuth(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  activeSubscribers += 1

  if (activeSubscribers === 1) {
    stopAuthRuntime = startAuthRuntime()
  }

  return () => {
    listeners.delete(onStoreChange)
    activeSubscribers -= 1

    if (activeSubscribers === 0) {
      stopAuthRuntime?.()
      stopAuthRuntime = null
      snapshot = {
        user: null,
        isLoading: true,
      }
    }
  }
}

function getEmailRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined
  }

  const basePath = import.meta.env.BASE_URL || "/"
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`
  return `${window.location.origin}${normalizedBasePath}auth/callback`
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { user, isLoading } = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthSnapshot,
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signInWithMagicLink: async (email: string) => {
          const redirectTo = getEmailRedirectUrl()

          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectTo,
            },
          })

          if (error) {
            throw error
          }
        },
        signOut: async () => {
          const { error } = await supabase.auth.signOut()
          if (error) {
            throw error
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
