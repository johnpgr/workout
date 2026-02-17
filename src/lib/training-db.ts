import Dexie, { type Table } from "dexie"
import { Temporal } from "@/lib/temporal"
import type {
  AppSetting,
  ExerciseSetLog,
  ReadinessLog,
  Recommendation,
  RecommendationKind,
  RecommendationStatus,
  SessionWithSets,
  SplitType,
  TrainingSession,
  WeightLog,
  WorkoutType,
} from "@/lib/training-types"

export type {
  AppSetting,
  ExerciseSetLog,
  ReadinessLog,
  Recommendation,
  RecommendationKind,
  RecommendationStatus,
  SessionWithSets,
  SplitType,
  TrainingSession,
  WeightLog,
  WorkoutType,
} from "@/lib/training-types"

export interface SaveSessionInput {
  session: Omit<TrainingSession, "id" | "createdAt" | "updatedAt" | "deletedAt" | "version">
  sets: Array<{
    exerciseName: string
    exerciseOrder: number
    setOrder: number
    weightKg: number
    reps: number
    rpe: number | null
    rir: number | null
    technique: ExerciseSetLog["technique"]
  }>
}

export interface SaveReadinessInput {
  date: string
  sleepHours: number
  sleepQuality: number
  stress: number
  pain: number
  readinessScore: number
  notes: string
}

export interface SaveWeightInput {
  date: string
  weightKg: number
  notes: string
}

export interface CreateRecommendationInput {
  date: string
  splitType: SplitType | null
  workoutType: WorkoutType | null
  kind: RecommendationKind
  status?: RecommendationStatus
  message: string
  reason: string
}

class TrainingLogsDatabase extends Dexie {
  sessions!: Table<TrainingSession, string>
  exerciseSets!: Table<ExerciseSetLog, string>
  readinessLogs!: Table<ReadinessLog, string>
  weightLogs!: Table<WeightLog, string>
  appSettings!: Table<AppSetting, string>
  recommendations!: Table<Recommendation, string>

  constructor() {
    super("treinos-v2-training")

    this.version(1).stores({
      sessions: "&id, date, splitType, workoutType, updatedAt, deletedAt",
      exercise_sets: "&id, sessionId, date, splitType, workoutType, exerciseName, updatedAt, deletedAt",
      readiness_logs: "&id, date, updatedAt, deletedAt",
      weight_logs: "&id, date, updatedAt, deletedAt",
      app_settings: "&id, &key, updatedAt",
      recommendations: "&id, date, status, kind, workoutType, updatedAt, deletedAt",
    })

    this.sessions = this.table("sessions")
    this.exerciseSets = this.table("exercise_sets")
    this.readinessLogs = this.table("readiness_logs")
    this.weightLogs = this.table("weight_logs")
    this.appSettings = this.table("app_settings")
    this.recommendations = this.table("recommendations")
  }
}

const db = new TrainingLogsDatabase()

function nowISO(): string {
  return Temporal.Now.instant().toString()
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createSyncMeta() {
  const timestamp = nowISO()
  return {
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    version: 1,
  } as const
}

function touchVersion<T extends { updatedAt: string; version: number }>(record: T): T {
  return {
    ...record,
    updatedAt: nowISO(),
    version: record.version + 1,
  }
}

function sortSessionsDescending(a: TrainingSession, b: TrainingSession): number {
  if (a.date !== b.date) {
    return a.date < b.date ? 1 : -1
  }
  return b.updatedAt.localeCompare(a.updatedAt)
}

function sortSets(a: ExerciseSetLog, b: ExerciseSetLog): number {
  if (a.exerciseOrder !== b.exerciseOrder) {
    return a.exerciseOrder - b.exerciseOrder
  }
  return a.setOrder - b.setOrder
}

async function getSetsBySessionIds(sessionIds: string[]): Promise<Map<string, ExerciseSetLog[]>> {
  if (!sessionIds.length) {
    return new Map()
  }

  const sets = await db.exerciseSets
    .where("sessionId")
    .anyOf(sessionIds)
    .filter((set) => set.deletedAt === null)
    .toArray()

  const grouped = new Map<string, ExerciseSetLog[]>()
  for (const set of sets.sort(sortSets)) {
    const current = grouped.get(set.sessionId) ?? []
    current.push(set)
    grouped.set(set.sessionId, current)
  }

  return grouped
}

export async function saveSessionWithSets(input: SaveSessionInput): Promise<string> {
  const meta = createSyncMeta()

  const session: TrainingSession = {
    ...meta,
    date: input.session.date,
    splitType: input.session.splitType,
    workoutType: input.session.workoutType,
    workoutLabel: input.session.workoutLabel,
    durationMin: input.session.durationMin,
    notes: input.session.notes,
  }

  const setRecords: ExerciseSetLog[] = input.sets.map((set) => ({
    ...createSyncMeta(),
    sessionId: session.id,
    date: session.date,
    splitType: session.splitType,
    workoutType: session.workoutType,
    exerciseName: set.exerciseName,
    exerciseOrder: set.exerciseOrder,
    setOrder: set.setOrder,
    weightKg: set.weightKg,
    reps: set.reps,
    rpe: set.rpe,
    rir: set.rir,
    technique: set.technique,
  }))

  await db.transaction("rw", db.sessions, db.exerciseSets, async () => {
    await db.sessions.add(session)
    if (setRecords.length) {
      await db.exerciseSets.bulkAdd(setRecords)
    }
  })

  return session.id
}

export async function getSessionsByDateRange(startDateISO: string, endDateISO: string): Promise<SessionWithSets[]> {
  const sessions = await db.sessions
    .where("date")
    .between(startDateISO, endDateISO, true, true)
    .filter((session) => session.deletedAt === null)
    .toArray()

  sessions.sort(sortSessionsDescending)

  const setsBySession = await getSetsBySessionIds(sessions.map((session) => session.id))

  return sessions.map((session) => ({
    session,
    sets: setsBySession.get(session.id) ?? [],
  }))
}

export async function getAllSessionsWithSets(): Promise<SessionWithSets[]> {
  const sessions = await db.sessions.filter((session) => session.deletedAt === null).toArray()
  sessions.sort(sortSessionsDescending)

  const setsBySession = await getSetsBySessionIds(sessions.map((session) => session.id))

  return sessions.map((session) => ({
    session,
    sets: setsBySession.get(session.id) ?? [],
  }))
}

export async function getLastSessionByWorkoutType(
  workoutType: WorkoutType,
  splitType: SplitType
): Promise<SessionWithSets | null> {
  const sessions = await db.sessions
    .where("workoutType")
    .equals(workoutType)
    .filter((session) => session.splitType === splitType && session.deletedAt === null)
    .toArray()

  sessions.sort(sortSessionsDescending)
  const latest = sessions[0]

  if (!latest) {
    return null
  }

  const sets = await db.exerciseSets
    .where("sessionId")
    .equals(latest.id)
    .filter((set) => set.deletedAt === null)
    .toArray()

  return { session: latest, sets: sets.sort(sortSets) }
}

export async function getRecentSessionsByWorkoutType(
  workoutType: WorkoutType,
  splitType: SplitType,
  limit = 3
): Promise<SessionWithSets[]> {
  const sessions = await db.sessions
    .where("workoutType")
    .equals(workoutType)
    .filter((session) => session.splitType === splitType && session.deletedAt === null)
    .toArray()

  sessions.sort(sortSessionsDescending)
  const selected = sessions.slice(0, limit)
  const setsBySession = await getSetsBySessionIds(selected.map((session) => session.id))

  return selected.map((session) => ({
    session,
    sets: setsBySession.get(session.id) ?? [],
  }))
}

export async function softDeleteSession(sessionId: string): Promise<void> {
  await db.transaction("rw", db.sessions, db.exerciseSets, async () => {
    const session = await db.sessions.get(sessionId)

    if (!session || session.deletedAt !== null) {
      return
    }

    const deletedTimestamp = nowISO()
    await db.sessions.put({
      ...touchVersion(session),
      deletedAt: deletedTimestamp,
    })

    const sets = await db.exerciseSets.where("sessionId").equals(sessionId).filter((set) => set.deletedAt === null).toArray()
    if (!sets.length) {
      return
    }

    await db.exerciseSets.bulkPut(
      sets.map((set) => ({
        ...touchVersion(set),
        deletedAt: deletedTimestamp,
      }))
    )
  })
}

export async function saveReadinessLog(input: SaveReadinessInput): Promise<string> {
  const currentByDate = await db.readinessLogs
    .where("date")
    .equals(input.date)
    .filter((log) => log.deletedAt === null)
    .first()

  if (currentByDate) {
    await db.readinessLogs.put({
      ...touchVersion(currentByDate),
      sleepHours: input.sleepHours,
      sleepQuality: input.sleepQuality,
      stress: input.stress,
      pain: input.pain,
      readinessScore: input.readinessScore,
      notes: input.notes,
    })

    return currentByDate.id
  }

  const record: ReadinessLog = {
    ...createSyncMeta(),
    date: input.date,
    sleepHours: input.sleepHours,
    sleepQuality: input.sleepQuality,
    stress: input.stress,
    pain: input.pain,
    readinessScore: input.readinessScore,
    notes: input.notes,
  }
  await db.readinessLogs.add(record)
  return record.id
}

export async function getLatestReadinessLog(): Promise<ReadinessLog | null> {
  const logs = await db.readinessLogs.filter((log) => log.deletedAt === null).toArray()
  logs.sort((a, b) => b.date.localeCompare(a.date))
  return logs[0] ?? null
}

export async function getReadinessLogsByDateRange(startDateISO: string, endDateISO: string): Promise<ReadinessLog[]> {
  const logs = await db.readinessLogs
    .where("date")
    .between(startDateISO, endDateISO, true, true)
    .filter((log) => log.deletedAt === null)
    .toArray()

  return logs.sort((a, b) => b.date.localeCompare(a.date))
}

export async function saveWeightLog(input: SaveWeightInput): Promise<string> {
  const currentByDate = await db.weightLogs
    .where("date")
    .equals(input.date)
    .filter((log) => log.deletedAt === null)
    .first()

  if (currentByDate) {
    await db.weightLogs.put({
      ...touchVersion(currentByDate),
      weightKg: input.weightKg,
      notes: input.notes,
    })
    return currentByDate.id
  }

  const record: WeightLog = {
    ...createSyncMeta(),
    date: input.date,
    weightKg: input.weightKg,
    notes: input.notes,
  }
  await db.weightLogs.add(record)
  return record.id
}

export async function getWeightLogs(): Promise<WeightLog[]> {
  const logs = await db.weightLogs.filter((log) => log.deletedAt === null).toArray()
  return logs.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getAllReadinessLogs(): Promise<ReadinessLog[]> {
  const logs = await db.readinessLogs.filter((log) => log.deletedAt === null).toArray()
  return logs.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getSetting(key: AppSetting["key"]): Promise<AppSetting | null> {
  const setting = await db.appSettings.where("key").equals(key).first()
  return setting?.deletedAt === null ? setting : null
}

export async function getAllSettings(): Promise<AppSetting[]> {
  return db.appSettings.filter((setting) => setting.deletedAt === null).toArray()
}

export async function setSetting(key: AppSetting["key"], value: string): Promise<string> {
  const current = await db.appSettings.where("key").equals(key).first()

  if (current) {
    await db.appSettings.put({
      ...touchVersion(current),
      value,
      deletedAt: null,
    })
    return current.id
  }

  const setting: AppSetting = {
    ...createSyncMeta(),
    key,
    value,
  }
  await db.appSettings.add(setting)
  return setting.id
}

export async function addRecommendation(input: CreateRecommendationInput): Promise<string> {
  const recommendation: Recommendation = {
    ...createSyncMeta(),
    date: input.date,
    splitType: input.splitType,
    workoutType: input.workoutType,
    kind: input.kind,
    status: input.status ?? "pending",
    message: input.message,
    reason: input.reason,
  }
  await db.recommendations.add(recommendation)
  return recommendation.id
}

export async function addRecommendationIfMissing(input: CreateRecommendationInput): Promise<string | null> {
  const existing = await db.recommendations
    .where("date")
    .equals(input.date)
    .filter((recommendation) => {
      return (
        recommendation.deletedAt === null &&
        recommendation.status === "pending" &&
        recommendation.kind === input.kind &&
        recommendation.workoutType === input.workoutType &&
        recommendation.splitType === input.splitType
      )
    })
    .first()

  if (existing) {
    return null
  }

  return addRecommendation(input)
}

export async function updateRecommendationStatus(id: string, status: RecommendationStatus): Promise<void> {
  const recommendation = await db.recommendations.get(id)
  if (!recommendation || recommendation.deletedAt !== null) {
    return
  }

  await db.recommendations.put({
    ...touchVersion(recommendation),
    status,
  })
}

export async function getRecommendations(status?: RecommendationStatus): Promise<Recommendation[]> {
  const recommendations = status
    ? await db.recommendations.where("status").equals(status).filter((item) => item.deletedAt === null).toArray()
    : await db.recommendations.filter((item) => item.deletedAt === null).toArray()

  return recommendations.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getBackupSnapshot() {
  const [sessions, readinessLogs, weightLogs, settings, recommendations] = await Promise.all([
    getAllSessionsWithSets(),
    getAllReadinessLogs(),
    getWeightLogs(),
    getAllSettings(),
    getRecommendations(),
  ])

  return {
    exportedAt: nowISO(),
    sessions,
    readinessLogs,
    weightLogs,
    settings,
    recommendations,
  }
}
