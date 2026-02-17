import { createContext }  from "react"
import type { SplitType } from "@/lib/training-types"

export interface AppLayoutContext {
  splitType: SplitType
  setSplitType: (splitType: SplitType) => Promise<void>
}

export const AppLayoutContext = createContext<AppLayoutContext>({} as AppLayoutContext)
