import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllSessionsWithSets, getBackupSnapshot } from "@/lib/training-db"

type BackupSnapshot = Awaited<ReturnType<typeof getBackupSnapshot>>

interface TrainingReportData {
  generatedAt: string
  totalSessions: number
  totalSets: number
  totalReadiness: number
  totalWeightEntries: number
  recentSessions: {
    date: string
    splitType: string
    workoutLabel: string
    durationMin: number
    setCount: number
  }[]
}

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

function createTrainingReportData(
  snapshot: BackupSnapshot,
): TrainingReportData {
  const totalSets = snapshot.sessions.reduce(
    (sum, session) => sum + session.sets.length,
    0,
  )

  return {
    generatedAt: new Date().toLocaleString(),
    totalSessions: snapshot.sessions.length,
    totalSets,
    totalReadiness: snapshot.readinessLogs.length,
    totalWeightEntries: snapshot.weightLogs.length,
    recentSessions: snapshot.sessions.slice(0, 12).map((entry) => ({
      date: entry.session.date,
      splitType: entry.session.splitType,
      workoutLabel: entry.session.workoutLabel,
      durationMin: entry.session.durationMin,
      setCount: entry.sets.length,
    })),
  }
}

export function DataExportCard() {
  const [reportData, setReportData] = useState<TrainingReportData | null>(null)
  const printReportRef = useRef<HTMLDivElement>(null)

  const reportMetricCardClassName = "rounded-lg border border-neutral-300 p-3"
  const reportTableHeadCellClassName =
    "border border-neutral-300 bg-neutral-100 p-2 text-left"
  const reportTableCellClassName = "border border-neutral-300 p-2 text-left"
  const printReport = useReactToPrint({
    contentRef: printReportRef,
    documentTitle: `relatorio-treino-${new Date().toISOString().slice(0, 10)}`,
  })

  async function handleExportJson() {
    const snapshot = await getBackupSnapshot()
    downloadTextFile(
      `backup-treinos-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(snapshot, null, 2),
      "application/json",
    )
  }

  async function handleExportCsv() {
    const sessions = await getAllSessionsWithSets()
    const rows: string[][] = [
      [
        "data",
        "tipoDivisao",
        "tipoTreino",
        "nomeTreino",
        "duracaoMin",
        "nomeExercicio",
        "ordemSerie",
        "pesoKg",
        "repeticoes",
        "rpe",
        "rir",
        "tecnica",
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
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n")

    downloadTextFile(
      `series-treino-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv;charset=utf-8",
    )
  }

  async function handleExportPdf() {
    const snapshot = await getBackupSnapshot()
    flushSync(() => {
      setReportData(createTrainingReportData(snapshot))
    })
    printReport()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exportação de dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" onClick={() => void handleExportJson()}>
            Exportar JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleExportCsv()}
          >
            Exportar CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleExportPdf()}
          >
            Exportar PDF
          </Button>
        </CardContent>
      </Card>

      <div
        aria-hidden="true"
        className="fixed top-0 left-[-10000px] w-[210mm] bg-white"
      >
        <div ref={printReportRef} className="p-6 font-sans text-neutral-900">
          <h1 className="mb-1.5 text-2xl font-semibold">
            Relatório do Aplicativo de Treino
          </h1>
          <p className="mt-0 text-sm text-neutral-600">
            Gerado em {reportData?.generatedAt ?? "-"}
          </p>

          <div className="my-[18px] grid grid-cols-2 gap-3">
            <div className={reportMetricCardClassName}>
              <strong>Total de sessões</strong>
              <div>{reportData?.totalSessions ?? 0}</div>
            </div>
            <div className={reportMetricCardClassName}>
              <strong>Total de séries registradas</strong>
              <div>{reportData?.totalSets ?? 0}</div>
            </div>
            <div className={reportMetricCardClassName}>
              <strong>Registros de prontidão</strong>
              <div>{reportData?.totalReadiness ?? 0}</div>
            </div>
            <div className={reportMetricCardClassName}>
              <strong>Registros de peso</strong>
              <div>{reportData?.totalWeightEntries ?? 0}</div>
            </div>
          </div>

          <h2>Sessões recentes</h2>
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr>
                <th className={reportTableHeadCellClassName}>Data</th>
                <th className={reportTableHeadCellClassName}>Divisão</th>
                <th className={reportTableHeadCellClassName}>Treino</th>
                <th className={reportTableHeadCellClassName}>Duração</th>
                <th className={reportTableHeadCellClassName}>Séries</th>
              </tr>
            </thead>
            <tbody>
              {(reportData?.recentSessions ?? []).map((entry, index) => (
                <tr key={`${entry.date}-${entry.workoutLabel}-${index}`}>
                  <td className={reportTableCellClassName}>{entry.date}</td>
                  <td className={reportTableCellClassName}>
                    {entry.splitType}
                  </td>
                  <td className={reportTableCellClassName}>
                    {entry.workoutLabel}
                  </td>
                  <td className={reportTableCellClassName}>
                    {entry.durationMin} min
                  </td>
                  <td className={reportTableCellClassName}>{entry.setCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
