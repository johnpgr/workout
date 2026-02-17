import { useMemo } from "react"
import { useAllSessionsQuery } from "@/features/training/queries"
import { getBestE1RMForExercise } from "@/features/progress/e1rm-utils"
import {
  calculateVolumeByMuscle,
  calculateWeeklyVolumeLoadTrend,
} from "@/features/progress/volume-utils"

export function useProgressSessionsQuery() {
  return useAllSessionsQuery()
}

export function useE1RMProgressQuery(exerciseName: string) {
  const sessionsQuery = useAllSessionsQuery()

  const data = useMemo(() => {
    if (!sessionsQuery.data) {
      return []
    }

    return getBestE1RMForExercise(sessionsQuery.data, exerciseName)
  }, [sessionsQuery.data, exerciseName])

  return {
    ...sessionsQuery,
    data,
  }
}

export function useWeeklyVolumeQuery() {
  const sessionsQuery = useAllSessionsQuery()

  const byMuscle = useMemo(() => {
    if (!sessionsQuery.data) {
      return []
    }

    return calculateVolumeByMuscle(sessionsQuery.data)
  }, [sessionsQuery.data])

  const trend = useMemo(() => {
    if (!sessionsQuery.data) {
      return []
    }

    return calculateWeeklyVolumeLoadTrend(sessionsQuery.data)
  }, [sessionsQuery.data])

  return {
    ...sessionsQuery,
    byMuscle,
    trend,
  }
}
