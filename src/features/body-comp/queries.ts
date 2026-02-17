import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { SaveWeightInput } from "@/lib/training-db"

const WEIGHT_QUERY_KEY = ["body-weight"] as const

export function useWeightLogsQuery() {
  return useQuery({
    queryKey: [...WEIGHT_QUERY_KEY, "all"],
    queryFn: async () => {
      const { getWeightLogs } = await import("@/lib/training-db")
      return getWeightLogs()
    },
  })
}

export function useSaveWeightMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SaveWeightInput) => {
      const { saveWeightLog } = await import("@/lib/training-db")
      return saveWeightLog(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WEIGHT_QUERY_KEY })

      const { scheduleSync } = await import("@/lib/sync")
      scheduleSync("mutation")
    },
  })
}
