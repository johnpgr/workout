import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  RecommendationStatus,
  SplitType,
  WorkoutType,
} from "@/lib/training-types"
import type { SaveSessionInput } from "@/lib/training-db"
import { buildProgressionSuggestion } from "@/features/training/rpe-utils"

const SESSIONS_QUERY_KEY = ["training-sessions"] as const
const SETTINGS_QUERY_KEY = ["app-settings"] as const
const RECOMMENDATIONS_QUERY_KEY = ["recommendations"] as const

export function useWeekSessionsQuery(startDateISO: string | undefined, endDateISO: string | undefined) {
  return useQuery({
    queryKey: [...SESSIONS_QUERY_KEY, "week", startDateISO, endDateISO],
    enabled: Boolean(startDateISO && endDateISO),
    queryFn: async () => {
      if (!startDateISO || !endDateISO) {
        return []
      }

      const { getSessionsByDateRange } = await import("@/lib/training-db")
      return getSessionsByDateRange(startDateISO, endDateISO)
    },
  })
}

export function useAllSessionsQuery() {
  return useQuery({
    queryKey: [...SESSIONS_QUERY_KEY, "all"],
    queryFn: async () => {
      const { getAllSessionsWithSets } = await import("@/lib/training-db")
      return getAllSessionsWithSets()
    },
  })
}

export function useLastSessionQuery(workoutType: WorkoutType, splitType: SplitType) {
  return useQuery({
    queryKey: [...SESSIONS_QUERY_KEY, "last", splitType, workoutType],
    queryFn: async () => {
      const { getLastSessionByWorkoutType } = await import("@/lib/training-db")
      return getLastSessionByWorkoutType(workoutType, splitType)
    },
  })
}

export function useAddSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SaveSessionInput) => {
      const { saveSessionWithSets } = await import("@/lib/training-db")
      return saveSessionWithSets(payload)
    },
    onSuccess: async (_, variables) => {
      const {
        addRecommendationIfMissing,
        getRecentSessionsByWorkoutType,
      } = await import("@/lib/training-db")

      const recentSessions = await getRecentSessionsByWorkoutType(
        variables.session.workoutType,
        variables.session.splitType,
        2
      )

      const suggestion = buildProgressionSuggestion(recentSessions)
      if (suggestion) {
        await addRecommendationIfMissing(suggestion)
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: RECOMMENDATIONS_QUERY_KEY }),
      ])
    },
  })
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { softDeleteSession } = await import("@/lib/training-db")
      await softDeleteSession(sessionId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY })
    },
  })
}

export function useAppSettingQuery(key: "active-split" | "theme-preference") {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, key],
    queryFn: async () => {
      const { getSetting } = await import("@/lib/training-db")
      return getSetting(key)
    },
  })
}

export function useSetAppSettingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { key: "active-split" | "theme-preference"; value: string }) => {
      const { setSetting } = await import("@/lib/training-db")
      await setSetting(payload.key, payload.value)
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...SETTINGS_QUERY_KEY, variables.key] }),
        queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY }),
      ])
    },
  })
}

export function useRecommendationsQuery(status: RecommendationStatus | "all" = "pending") {
  return useQuery({
    queryKey: [...RECOMMENDATIONS_QUERY_KEY, status],
    queryFn: async () => {
      const { getRecommendations } = await import("@/lib/training-db")
      return getRecommendations(status === "all" ? undefined : status)
    },
  })
}

export function useRecommendationStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; status: RecommendationStatus }) => {
      const { updateRecommendationStatus } = await import("@/lib/training-db")
      await updateRecommendationStatus(payload.id, payload.status)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RECOMMENDATIONS_QUERY_KEY })
    },
  })
}
