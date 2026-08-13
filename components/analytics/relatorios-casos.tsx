"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { processosApi, type ProcessoApi } from "@/lib/processos-api"
import {
  RELATORIO_FILTROS_VAZIOS,
  filtrarProcessosRelatorio,
  processosParaCsv,
  type RelatorioFiltros,
} from "@/lib/relatorios-casos"
import { downloadBlob } from "@/lib/download"
import { formatDatePt } from "@/lib/format"
import { formatCnj } from "@/lib/masks"
import { casoHref } from "@/lib/app-routes"
import { PROCESSO_STATUS_OPTIONS } from "@/lib/processo-status"

export function RelatoriosCasos() {
  const { toast } = useToast()
  const [processos, setProcessos] = useState<ProcessoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filtros, setFiltros] = useState<RelatorioFiltros>(RELATORIO_FILTROS_VAZIOS)

  useEffect(() => {
    let ativo = true
    void (async () => {
      setLoading(true)
      try {
        const data = await processosApi.listar()
        if (ativo) setProcessos(data)
      } catch (error) {
        toast({
          title: "Erro ao carregar casos",
          description: error instanceof Error ? error.message : "Falha na API",
          variant: "destructive",
        })
      } finally {
        if (ativo) setLoading(false)
      }
    })()
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(
    () => filtrarProcessosRelatorio(processos, filtros),
    [processos, filtros],
  )

  const statusOptions = useMemo(() => {
    const extras = processos
      .map((p) => p.status)
      .filter((s) => s && !(PROCESSO_STATUS_OPTIONS as readonly string[]).includes(s))
    return [...PROCESSO_STATUS_OPTIONS, ...Array.from(new Set(extras))]
  }, [processos])

  const responsaveis = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of processos) {
      if (p.responsavelId && p.responsavel?.nome) {
        map.set(p.responsavelId, p.responsavel.nome)
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
  }, [processos])

  const patch = (partial: Partial<RelatorioFiltros>) => {
    setFiltros((atual) => ({ ...atual, ...partial }))
  }

  const exportar = async () => {
    setExporting(true)
    try {
      const csv = processosParaCsv(filtrados)
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
      downloadBlob(blob, `relatorio-casos-${new Date().toISOString().slice(0, 10)}.csv`)
      toast({
        title: "Relatório exportado",
        description: `${filtrados.length} caso(s) no CSV`,
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-lg">Casos do relatório</h2>
          <p className="text-sm text-muted-foreground">
            Filtre e exporte só o recorte que precisa — o CSV segue os filtros abaixo.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltros(RELATORIO_FILTROS_VAZIOS)}
          >
            Limpar filtros
          </Button>
          <Button
            type="button"
            disabled={exporting || loading}
            onClick={() => void exportar()}
          >
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="relatorio-busca">Busca</Label>
          <Input
            id="relatorio-busca"
            value={filtros.busca}
            onChange={(e) => patch({ busca: e.target.value })}
            placeholder="Número, título ou cliente"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={filtros.status} onValueChange={(status) => patch({ status })}>
            <SelectTrigger aria-label="Filtrar por status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select
            value={filtros.prioridade}
            onValueChange={(prioridade) => patch({ prioridade })}
          >
            <SelectTrigger aria-label="Filtrar por prioridade">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Situação</Label>
          <Select
            value={filtros.situacao}
            onValueChange={(situacao) => patch({ situacao })}
          >
            <SelectTrigger aria-label="Filtrar por situação">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="ativos">Em andamento</SelectItem>
              <SelectItem value="concluidos">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Select
            value={filtros.responsavelId}
            onValueChange={(responsavelId) => patch({ responsavelId })}
          >
            <SelectTrigger aria-label="Filtrar por responsável">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="__none__">Sem responsável</SelectItem>
              {responsaveis.map(([id, nome]) => (
                <SelectItem key={id} value={id}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="relatorio-prazo-de">Prazo de</Label>
          <Input
            id="relatorio-prazo-de"
            type="date"
            value={filtros.prazoDe}
            onChange={(e) => patch({ prazoDe: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="relatorio-prazo-ate">Prazo até</Label>
          <Input
            id="relatorio-prazo-ate"
            type="date"
            value={filtros.prazoAte}
            onChange={(e) => patch({ prazoAte: e.target.value })}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {loading
          ? "Carregando casos..."
          : `${filtrados.length} de ${processos.length} caso(s) com os filtros atuais.`}
      </p>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum caso com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={casoHref(item.id)} className="underline-offset-2 hover:underline">
                      {formatCnj(item.numero)}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-normal max-w-[220px]">
                    {item.titulo || "—"}
                  </TableCell>
                  <TableCell className="whitespace-normal max-w-[180px]">
                    {item.cliente?.nome || "—"}
                  </TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{formatDatePt(item.prazo)}</TableCell>
                  <TableCell>{item.responsavel?.nome || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
