import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { SaveReadinessInput } from "@/lib/training-db"

const READINESS_QUERY_KEY = ["readiness"] as const

export function useLatestReadinessQuery() {
  return useQuery({
    queryKey: [...READINESS_QUERY_KEY, "latest"],
    queryFn: async () => {
      const { getLatestReadinessLog } = await import("@/lib/training-db")
      return getLatestReadinessLog()
    },
  })
}

export function useReadinessRangeQuery(startDateISO: string, endDateISO: string) {
  return useQuery({
    queryKey: [...READINESS_QUERY_KEY, "range", startDateISO, endDateISO],
    queryFn: async () => {
      const { getReadinessLogsByDateRange } = await import("@/lib/training-db")
      return getReadinessLogsByDateRange(startDateISO, endDateISO)
    },
  })
}

export function useSaveReadinessMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SaveReadinessInput) => {
      const { saveReadinessLog } = await import("@/lib/training-db")
      return saveReadinessLog(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: READINESS_QUERY_KEY })
    },
  })
}
