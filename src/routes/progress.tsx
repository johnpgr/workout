import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "src/layouts/app-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { E1RMChart } from "@/features/progress/components/e1rm-chart"
import { VolumeChart } from "@/features/progress/components/volume-chart"
import { VolumeTrendChart } from "@/features/progress/components/volume-trend-chart"
import { WeightForm } from "@/features/body-comp/components/weight-form"
import { WeightTrendChart } from "@/features/body-comp/components/weight-trend-chart"

export const Route = createFileRoute("/progress")({
  ssr: false,
  component: ProgressRoute,
})

type ProgressTab = "e1rm" | "volume" | "weight"

function ProgressRoute() {
  const [tab, setTab] = useState<ProgressTab>("e1rm")

  return (
    <AppLayout>
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={tab === "e1rm" ? "default" : "outline"}
            onClick={() => setTab("e1rm")}
          >
            e1RM
          </Button>
          <Button
            variant={tab === "volume" ? "default" : "outline"}
            onClick={() => setTab("volume")}
          >
            Volume
          </Button>
          <Button
            variant={tab === "weight" ? "default" : "outline"}
            onClick={() => setTab("weight")}
          >
            Peso
          </Button>
        </div>

        {tab === "e1rm" ? <E1RMChart /> : null}

        {tab === "volume" ? (
          <div className="space-y-4">
            <VolumeChart />
            <VolumeTrendChart />
          </div>
        ) : null}

        {tab === "weight" ? (
          <div className="space-y-4">
            <WeightForm />
            <WeightTrendChart />
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
