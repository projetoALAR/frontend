"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { formatDateTimePt } from "@/lib/format"
import {
  auditoriaApi,
  AUDIT_ACAO_LABEL,
  AUDIT_ENTIDADE_LABEL,
  type AuditAcao,
  type AuditEntidade,
  type AuditLogApi,
} from "@/lib/auditoria-api"

const PAGE_SIZE = 30

export function AuditoriaContent() {
  const { toast } = useToast()
  const [items, setItems] = useState<AuditLogApi[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [entidade, setEntidade] = useState<string>("ALL")
  const [acao, setAcao] = useState<string>("ALL")
  const [de, setDe] = useState("")
  const [ate, setAte] = useState("")

  const load = useCallback(
    async (nextPage = page) => {
      setLoading(true)
      try {
        const data = await auditoriaApi.listar({
          entidade: entidade === "ALL" ? "" : (entidade as AuditEntidade),
          acao: acao === "ALL" ? "" : (acao as AuditAcao),
          de: de || undefined,
          ate: ate || undefined,
          page: nextPage,
          limit: PAGE_SIZE,
        })
        setItems(data.items)
        setTotal(data.total)
        setPage(data.page)
      } catch (error) {
        toast({
          title: "Erro ao carregar auditoria",
          description: error instanceof Error ? error.message : "Falha na API",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [acao, ate, de, entidade, page, toast],
  )

  useEffect(() => {
    void load(1)
    // filtros: recarrega da página 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entidade, acao, de, ate])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Entidade</Label>
          <Select value={entidade} onValueChange={setEntidade}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="CLIENTE">Cliente</SelectItem>
              <SelectItem value="PROCESSO">Caso</SelectItem>
              <SelectItem value="DOCUMENTO">Documento</SelectItem>
              <SelectItem value="USUARIO">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Ação</Label>
          <Select value={acao} onValueChange={setAcao}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="CRIAR">Criou</SelectItem>
              <SelectItem value="EDITAR">Editou</SelectItem>
              <SelectItem value="EXCLUIR">Excluiu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-de">De</Label>
          <Input id="audit-de" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-ate">Até</Label>
          <Input id="audit-ate" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Quem</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>O quê</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum evento ainda. Criar, editar ou excluir um cliente/caso gera o primeiro registro.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTimePt(item.criadoEm)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.usuarioNome || "Sistema"}</div>
                    <div className="text-xs text-muted-foreground">{item.usuarioEmail || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.acao === "EXCLUIR" ? "destructive" : "secondary"}>
                      {AUDIT_ACAO_LABEL[item.acao]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground mr-2">
                      {AUDIT_ENTIDADE_LABEL[item.entidade]}
                    </span>
                    {item.resumo}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} evento{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => void load(page - 1)}
          >
            Anterior
          </Button>
          <span className="self-center">
            {page}/{totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => void load(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
