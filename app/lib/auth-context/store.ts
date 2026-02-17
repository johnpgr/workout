import { createContext } from "react"
import type { User } from "@supabase/supabase-js"

export interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContext>({} as AuthContext)
