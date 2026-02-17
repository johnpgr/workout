import { BarbellIcon, ChartBarIcon, GearIcon, HouseIcon } from "@phosphor-icons/react"
import { Link, useRouterState } from "@tanstack/react-router"

function linkClassName(isActive: boolean): string {
  return isActive
    ? "flex flex-col items-center gap-1 text-primary"
    : "flex flex-col items-center gap-1 text-muted-foreground"
}

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isDashboardActive = pathname === "/"
  const isWorkoutActive = pathname.startsWith("/workout")
  const isProgressActive = pathname.startsWith("/progress")
  const isSettingsActive = pathname.startsWith("/settings")

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background/95 px-4 py-2 backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        <li>
          <Link to="/" className={linkClassName(isDashboardActive)}>
            <HouseIcon className="size-5" />
            <span className="text-[11px]">Início</span>
          </Link>
        </li>
        <li>
          <Link to="/workout" className={linkClassName(isWorkoutActive)}>
            <BarbellIcon className="size-5" />
            <span className="text-[11px]">Treino</span>
          </Link>
        </li>
        <li>
          <Link to="/progress" className={linkClassName(isProgressActive)}>
            <ChartBarIcon className="size-5" />
            <span className="text-[11px]">Progresso</span>
          </Link>
        </li>
        <li>
          <Link to="/settings" className={linkClassName(isSettingsActive)}>
            <GearIcon className="size-5" />
            <span className="text-[11px]">Ajustes</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
