import { useMemo } from "react"
import { useOutletContext } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSplitConfig } from "@/features/training/splits/split-registry"
import type { SplitType } from "@/lib/training-types"
import type { AppLayoutContextValue } from "@/layouts/app-layout"

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function SettingsPage() {
  const { splitType, setSplitType } = useOutletContext<AppLayoutContextValue>()

  const splitLabel = useMemo(() => getSplitConfig(splitType).label, [splitType])

  async function handleExportJson() {
    const { getBackupSnapshot } = await import("@/lib/training-db")
    const snapshot = await getBackupSnapshot()
    downloadTextFile(
      `training-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(snapshot, null, 2),
      "application/json"
    )
  }

  async function handleExportCsv() {
    const { getAllSessionsWithSets } = await import("@/lib/training-db")
    const sessions = await getAllSessionsWithSets()

    const rows = [
      [
        "date",
        "splitType",
        "workoutType",
        "workoutLabel",
        "durationMin",
        "exerciseName",
        "setOrder",
        "weightKg",
        "reps",
        "rpe",
        "rir",
        "technique",
      ],
    ]

    for (const sessionEntry of sessions) {
      for (const set of sessionEntry.sets) {
        rows.push([
          sessionEntry.session.date,
          sessionEntry.session.splitType,
          sessionEntry.session.workoutType,
          sessionEntry.session.workoutLabel,
          String(sessionEntry.session.durationMin),
          set.exerciseName,
          String(set.setOrder + 1),
          String(set.weightKg),
          String(set.reps),
          set.rpe === null ? "" : String(set.rpe),
          set.rir === null ? "" : String(set.rir),
          set.technique ?? "",
        ])
      }
    }

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n")

    downloadTextFile(
      `training-sets-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv;charset=utf-8"
    )
  }

  async function handleExportPdf() {
    const { getBackupSnapshot } = await import("@/lib/training-db")
    const snapshot = await getBackupSnapshot()

    const totalSessions = snapshot.sessions.length
    const totalSets = snapshot.sessions.reduce((sum, session) => sum + session.sets.length, 0)
    const totalReadiness = snapshot.readinessLogs.length
    const totalWeightEntries = snapshot.weightLogs.length

    const popup = window.open("", "_blank", "width=1000,height=800")
    if (!popup) {
      return
    }

    popup.document.write(`
      <html>
        <head>
          <title>Training Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 6px; }
            .muted { color: #555; margin-top: 0; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f8f8f8; }
          </style>
        </head>
        <body>
          <h1>Training App Report</h1>
          <p class="muted">Generated at ${new Date().toLocaleString()}</p>

          <div class="grid">
            <div class="card"><strong>Total sessions</strong><div>${totalSessions}</div></div>
            <div class="card"><strong>Total set logs</strong><div>${totalSets}</div></div>
            <div class="card"><strong>Readiness check-ins</strong><div>${totalReadiness}</div></div>
            <div class="card"><strong>Weight entries</strong><div>${totalWeightEntries}</div></div>
          </div>

          <h2>Recent Sessions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Split</th>
                <th>Workout</th>
                <th>Duration</th>
                <th>Sets</th>
              </tr>
            </thead>
            <tbody>
              ${snapshot.sessions
                .slice(0, 12)
                .map(
                  (entry) => `
                    <tr>
                      <td>${entry.session.date}</td>
                      <td>${entry.session.splitType}</td>
                      <td>${entry.session.workoutLabel}</td>
                      <td>${entry.session.durationMin} min</td>
                      <td>${entry.sets.length}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `)

    popup.document.close()
    popup.focus()
    popup.print()
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Split ativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Atual: {splitLabel}</p>

          <Select value={splitType} onValueChange={(value) => void setSplitType(value as SplitType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o split" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ppl">Push / Pull / Legs</SelectItem>
              <SelectItem value="upper-lower">Upper / Lower</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exportação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" onClick={() => void handleExportJson()}>
            Exportar JSON
          </Button>
          <Button type="button" variant="outline" onClick={() => void handleExportCsv()}>
            Exportar CSV
          </Button>
          <Button type="button" variant="outline" onClick={() => void handleExportPdf()}>
            Exportar PDF
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
