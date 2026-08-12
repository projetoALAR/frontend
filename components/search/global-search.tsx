"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Loader2, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { buscaApi, type BuscaResultadoItem } from "@/lib/busca-api"

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<BuscaResultadoItem[]>([])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const buscar = useCallback(async (termo: string) => {
    const q = termo.trim()
    if (q.length < 2) {
      setResultados([])
      return
    }
    setLoading(true)
    try {
      const res = await buscaApi.buscar(q)
      setResultados(res.resultados)
    } catch {
      setResultados([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      void buscar(query)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [open, query, buscar])

  const handleSelect = (item: BuscaResultadoItem) => {
    setOpen(false)
    setQuery("")
    setResultados([])
    router.push(item.href)
  }

  const clientes = resultados.filter((r) => r.tipo === "CLIENTE")
  const processos = resultados.filter((r) => r.tipo === "PROCESSO")

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex h-8 gap-2 text-muted-foreground max-w-[220px] lg:max-w-xs flex-1 justify-start px-2.5"
        onClick={() => setOpen(true)}
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate text-xs">Buscar clientes, casos, CPF, CNJ...</span>
        <kbd className="ml-auto hidden lg:inline-flex h-5 items-center rounded border bg-muted px-1 font-mono text-[10px]">
          Ctrl+K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        title="Buscar"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Busca global"
        description="Pesquise clientes e casos por nome, CPF ou número CNJ"
      >
        <CommandInput
          placeholder="Nome, CPF, CNJ, título do caso..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando...
            </div>
          ) : query.trim().length < 2 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Digite ao menos 2 caracteres
            </div>
          ) : (
            <>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              {clientes.length > 0 && (
                <CommandGroup heading="Clientes">
                  {clientes.map((item) => (
                    <CommandItem
                      key={`${item.tipo}-${item.id}`}
                      value={`${item.tipo}-${item.id}-${item.titulo}`}
                      onSelect={() => handleSelect(item)}
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.titulo}</span>
                        {item.subtitulo ? (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.subtitulo}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {clientes.length > 0 && processos.length > 0 && <CommandSeparator />}
              {processos.length > 0 && (
                <CommandGroup heading="Casos">
                  {processos.map((item) => (
                    <CommandItem
                      key={`${item.tipo}-${item.id}`}
                      value={`${item.tipo}-${item.id}-${item.titulo}`}
                      onSelect={() => handleSelect(item)}
                    >
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.titulo}</span>
                        {item.subtitulo ? (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.subtitulo}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
