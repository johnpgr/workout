import { BarbellIcon, WarningIcon } from "@phosphor-icons/react"

export function AppFooter() {
  return (
    <footer className="space-y-1 pb-20 text-center text-sm text-muted-foreground md:pb-4">
      <p className="flex items-center justify-center gap-2">
        <BarbellIcon className="size-4" aria-hidden="true" />
        <span>MVP v1: treino avançado + sleep/readiness, offline-first.</span>
      </p>
      <p className="flex items-center justify-center gap-2 text-xs">
        <WarningIcon className="size-4" aria-hidden="true" />
        <span>Consulte profissionais para ajustes individualizados.</span>
      </p>
    </footer>
  )
}
