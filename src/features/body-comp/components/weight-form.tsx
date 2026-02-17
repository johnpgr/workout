import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSaveWeightMutation } from "@/features/body-comp/queries"
import { getCurrentDate } from "@/lib/temporal"

export function WeightForm() {
  const saveWeightMutation = useSaveWeightMutation()

  const [date, setDate] = useState(getCurrentDate().toString())
  const [weightKg, setWeightKg] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedWeight = Number(weightKg)
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return
    }

    await saveWeightMutation.mutateAsync({
      date,
      weightKg: parsedWeight,
      notes: notes.trim(),
    })

    setWeightKg("")
    setNotes("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Peso diário</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground" htmlFor="weight-date">
              Data
            </label>
            <Input id="weight-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground" htmlFor="weight-kg">
              Peso (kg)
            </label>
            <Input
              id="weight-kg"
              type="number"
              step={0.1}
              min={0}
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
              placeholder="Ex: 76.4"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground" htmlFor="weight-notes">
              Observações
            </label>
            <Textarea
              id="weight-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Retenção, refeição tardia, etc."
              className="min-h-20"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saveWeightMutation.isPending}>
              Salvar peso
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
