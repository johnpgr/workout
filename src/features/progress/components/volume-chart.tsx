import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWeeklyVolumeQuery } from "@/features/progress/queries"

function colorByStatus(status: "low" | "target" | "high"): string {
  if (status === "low") return "#ef4444"
  if (status === "target") return "#22c55e"
  return "#f59e0b"
}

export function VolumeChart() {
  const volumeQuery = useWeeklyVolumeQuery()
  const data = volumeQuery.byMuscle

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Séries semanais por músculo</CardTitle>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <p className="text-sm text-muted-foreground">Sem volume registrado ainda.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="muscleGroup" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sets">
                  {data.map((entry) => (
                    <Cell key={entry.muscleGroup} fill={colorByStatus(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
