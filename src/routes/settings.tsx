import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "src/layouts/app-layout"
import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSyncStatus } from "@/lib/sync"
import { getSplitConfig } from "@/features/training/splits/split-registry"
import type { SplitType } from "@/lib/training-types"
import { AuthContext } from "@/lib/auth-context/store"
import { AppLayoutContext } from "src/layouts/app-layout/context"

export const Route = createFileRoute("/settings")({
  ssr: false,
  component: SettingsRoute,
})

function SettingsRoute() {
  return (
    <AppLayout>
      <SettingsRouteContent />
    </AppLayout>
  )
}

function SettingsRouteContent() {
  const { splitType, setSplitType } = use(AppLayoutContext)
  const { user, isAuthenticated, isLoading, signInWithMagicLink, signOut } =
    use(AuthContext)
  const {
    lastSyncAt,
    syncError,
    pendingChanges,
    isSyncing,
    storageChecked,
    storagePersisted,
    isIOS,
    syncNow,
  } = useSyncStatus()

  const [email, setEmail] = useState("")
  const [authStatus, setAuthStatus] = useState<string | null>(null)

  const splitLabel = getSplitConfig(splitType).label

  async function handleSignInWithMagicLink() {
    if (!email.trim()) {
      setAuthStatus("Informe um e-mail para receber o link mágico.")
      return
    }

    try {
      await signInWithMagicLink(email.trim())
      setAuthStatus("Link mágico enviado. Verifique sua caixa de entrada.")
    } catch (error) {
      setAuthStatus(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o link mágico.",
      )
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setAuthStatus("Sessão encerrada.")
    } catch (error) {
      setAuthStatus(
        error instanceof Error ? error.message : "Não foi possível sair.",
      )
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando sessão...
            </p>
          ) : isAuthenticated ? (
            <>
              <p className="text-sm text-muted-foreground">
                Conectado como{" "}
                <span className="font-medium text-foreground">
                  {user?.email ?? "usuário"}
                </span>
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSignOut()}
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Você está no modo convidado local.
              </p>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button
                  type="button"
                  onClick={() => void handleSignInWithMagicLink()}
                >
                  Enviar link mágico
                </Button>
              </div>
            </>
          )}

          {authStatus ? (
            <p className="text-sm text-muted-foreground">{authStatus}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sincronização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Salvo no dispositivo:{" "}
            {pendingChanges > 0
              ? "Sim (sincronização em nuvem pendente)"
              : "Sim"}
          </p>
          <p className="text-sm text-muted-foreground">
            Sincronização em nuvem:{" "}
            {isAuthenticated ? "Ativada" : "Desativada (não autenticado)"}
          </p>
          <p className="text-sm text-muted-foreground">
            Última sincronização:{" "}
            {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : "Nunca"}
          </p>
          {syncError ? (
            <p className="text-sm text-destructive">Último erro: {syncError}</p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            disabled={!isAuthenticated || isSyncing}
            onClick={() => void syncNow()}
          >
            {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Divisão ativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Atual: {splitLabel}</p>

          <Select
            value={splitType}
            onValueChange={(value) => void setSplitType(value as SplitType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a divisão">
                {splitLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ppl">Empurrar / Puxar / Pernas</SelectItem>
              <SelectItem value="upper-lower">Superior / Inferior</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {storageChecked && isIOS && storagePersisted === false ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Aviso de armazenamento no iOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No Safari do iOS, os dados offline funcionam em modo de melhor
              esforço sem armazenamento persistente. Instale este app na tela
              inicial para retenção offline mais confiável.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
