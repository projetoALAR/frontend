"use client"

import { useMemo, useRef, useState, type ReactNode } from "react"
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { downloadBlob } from "@/lib/download"
import type { PreviewImportacao } from "@/lib/clientes-api"

const IGNORAR = "__ignorar__"

type RelatorioLinha = {
  linha: number
  status: string
  motivo?: string
  nome?: string
  numero?: string
  email?: string
  clienteNome?: string
}

type RelatorioImportacao = {
  total: number
  criados: number
  duplicados: number
  erros: number
  resultados: RelatorioLinha[]
}

type ExigirUmDe = { chaves: string[]; rotulo: string }

type ImportMapDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
  titulo: string
  descricao: string
  modeloFilename: string
  baixarModelo: () => Promise<{ blob: Blob; filename?: string }>
  preview: (arquivo: File) => Promise<PreviewImportacao>
  importar: (
    arquivo: File,
    mapeamento: Record<string, string | null>,
  ) => Promise<RelatorioImportacao>
  dicaObrigatoria: string
  /** Limite de linhas (clientes/casos 500, equipe 100). */
  maxLinhas?: number
  /** Grupos em que ao menos um campo deve estar mapeado. */
  exigirUmDe?: ExigirUmDe[]
  /** Conteúdo extra na etapa de mapeamento (ex.: senha padrão). */
  extras?: ReactNode
}

type Passo = "upload" | "mapear" | "resultado"
type FiltroResultado = "todos" | "problemas" | "erros" | "duplicados"

function rotuloStatus(status: string): string {
  if (status === "criado") return "Criado"
  if (status === "duplicado") return "Duplicado"
  if (status === "erro") return "Erro"
  return status
}

function validarMapeamentoUi(
  mapeamento: Record<string, string | null>,
  preview: PreviewImportacao,
  exigirUmDe?: ExigirUmDe[],
): string | null {
  const usados = new Set(
    Object.values(mapeamento).filter((v): v is string => !!v),
  )
  for (const campo of preview.camposAlvo) {
    if (!campo.obrigatorio || campo.documentoFlexivel) continue
    if (!usados.has(campo.chave)) {
      return `Mapeie a coluna obrigatória: ${campo.rotulo}`
    }
  }
  for (const grupo of exigirUmDe ?? []) {
    if (!grupo.chaves.some((k) => usados.has(k))) {
      return `Mapeie ao menos uma coluna: ${grupo.rotulo}`
    }
  }
  return null
}

function rotuloLinha(r: RelatorioLinha): string {
  const partes = [r.nome, r.numero, r.email, r.clienteNome].filter(Boolean)
  return partes.length ? partes.join(" · ") : ""
}

function csvEscapar(valor: string): string {
  if (/[;"\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`
  return valor
}

function baixarProblemasCsv(resultado: RelatorioImportacao, titulo: string) {
  const linhas = resultado.resultados.filter((r) => r.status !== "criado")
  const header = "linha;status;identificacao;motivo"
  const body = linhas
    .map((r) =>
      [
        String(r.linha),
        rotuloStatus(r.status),
        rotuloLinha(r),
        r.motivo ?? "",
      ]
        .map(csvEscapar)
        .join(";"),
    )
    .join("\n")
  const blob = new Blob(["\uFEFF" + header + "\n" + body], {
    type: "text/csv;charset=utf-8",
  })
  const safe = titulo.toLowerCase().replace(/\s+/g, "-")
  downloadBlob(blob, `importacao-${safe}-problemas.csv`)
}

export function ImportMapDialog({
  open,
  onOpenChange,
  onImported,
  titulo,
  descricao,
  modeloFilename,
  baixarModelo,
  preview,
  importar,
  dicaObrigatoria,
  maxLinhas = 500,
  exigirUmDe,
  extras,
}: ImportMapDialogProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [passo, setPasso] = useState<Passo>("upload")
  const [busy, setBusy] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewImportacao | null>(null)
  const [mapeamento, setMapeamento] = useState<Record<string, string | null>>({})
  const [resultado, setResultado] = useState<RelatorioImportacao | null>(null)
  const [filtro, setFiltro] = useState<FiltroResultado>("problemas")

  const reset = () => {
    setPasso("upload")
    setArquivo(null)
    setPreviewData(null)
    setMapeamento({})
    setResultado(null)
    setFiltro("problemas")
    setBusy(false)
  }

  const erroMapeamento = useMemo(() => {
    if (!previewData) return null
    return validarMapeamentoUi(mapeamento, previewData, exigirUmDe)
  }, [mapeamento, previewData, exigirUmDe])

  const handleBaixarModelo = async () => {
    setBaixando(true)
    try {
      const { blob, filename } = await baixarModelo()
      downloadBlob(blob, filename || modeloFilename)
    } catch (error) {
      toast({
        title: "Não foi possível baixar o modelo",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setBaixando(false)
    }
  }

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const nome = file.name.toLowerCase()
    if (!nome.endsWith(".xlsx") && !nome.endsWith(".csv")) {
      toast({
        title: "Formato inválido",
        description: "Envie um arquivo .xlsx (Excel) ou .csv.",
        variant: "destructive",
      })
      return
    }

    setBusy(true)
    setResultado(null)
    try {
      const res = await preview(file)
      if (res.totalLinhas === 0) {
        toast({
          title: "Arquivo sem dados",
          description: "Não há linhas para importar. Verifique a aba Dados.",
          variant: "destructive",
        })
        return
      }
      if (res.totalLinhas > maxLinhas) {
        toast({
          title: "Arquivo grande demais",
          description: `Limite de ${maxLinhas} linhas por importação. Divida o arquivo.`,
          variant: "destructive",
        })
        return
      }
      const map: Record<string, string | null> = {}
      res.sugestoes.forEach((s, i) => {
        map[String(i)] = s
      })
      const vistos = new Set<string>()
      for (const [k, v] of Object.entries(map)) {
        if (!v) continue
        if (vistos.has(v)) map[k] = null
        else vistos.add(v)
      }
      setArquivo(file)
      setPreviewData(res)
      setMapeamento(map)
      setPasso("mapear")
      toast({
        title: "Arquivo lido",
        description: `${res.totalLinhas} linha(s) encontradas. Confira o mapeamento.`,
      })
    } catch (error) {
      toast({
        title: "Falha ao ler arquivo",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  const handleImportar = async () => {
    if (!arquivo || !previewData) return
    const erro = validarMapeamentoUi(mapeamento, previewData, exigirUmDe)
    if (erro) {
      toast({
        title: "Mapeamento incompleto",
        description: erro,
        variant: "destructive",
      })
      return
    }
    setBusy(true)
    try {
      const res = await importar(arquivo, mapeamento)
      setResultado(res)
      setPasso("resultado")
      setFiltro(res.erros + res.duplicados > 0 ? "problemas" : "todos")
      if (res.criados > 0) onImported()
      toast({
        title:
          res.criados > 0
            ? "Importação concluída"
            : "Nenhuma linha criada",
        description: `${res.criados} criado(s), ${res.duplicados} duplicado(s), ${res.erros} erro(s).`,
        variant: res.criados > 0 ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Falha na importação",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  const camposUsados = new Set(
    Object.values(mapeamento).filter((v): v is string => !!v),
  )

  const linhasFiltradas = useMemo(() => {
    if (!resultado) return []
    return resultado.resultados.filter((r) => {
      if (filtro === "todos") return true
      if (filtro === "problemas") return r.status !== "criado"
      if (filtro === "erros") return r.status === "erro"
      return r.status === "duplicado"
    })
  }, [resultado, filtro])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>

        {passo === "upload" && (
          <div className="space-y-4">
            <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
              <li>
                Prefere o modelo Alar? Baixe o Excel com abas Instruções / Dados /
                Exemplos.
              </li>
              <li>
                Já tem planilha do escritório? Envie direto — o sistema sugere o
                mapeamento das colunas.
              </li>
              <li>Confirme o mapeamento e importe (até {maxLinhas} linhas).</li>
            </ol>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={baixando || busy}
                onClick={() => void handleBaixarModelo()}
              >
                {baixando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                Baixar modelo Excel
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
                onChange={(e) => void handleArquivo(e)}
              />
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                {busy ? "Lendo..." : "Enviar minha planilha"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              Aceita .xlsx ou .csv de qualquer sistema (export do escritório).
            </p>
          </div>
        )}

        {passo === "mapear" && previewData && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Arquivo: <span className="font-medium text-foreground">{arquivo?.name}</span>
              {" · "}
              {previewData.totalLinhas} linha(s). {dicaObrigatoria}
            </p>

            {erroMapeamento ? (
              <p className="text-sm text-amber-700 dark:text-amber-300 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                {erroMapeamento}
              </p>
            ) : (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Mapeamento pronto para importar.
              </p>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr] gap-0 text-xs font-medium bg-muted/50 px-3 py-2 border-b">
                <span>Coluna do seu arquivo</span>
                <span>Campo no Alar</span>
              </div>
              <ul className="max-h-64 overflow-auto divide-y">
                {previewData.cabecalhos.map((cab, i) => {
                  const key = String(i)
                  const atual = mapeamento[key]
                  return (
                    <li
                      key={key}
                      className="grid grid-cols-[1fr_1fr] gap-2 items-center px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{cab}</p>
                        {previewData.amostra[0]?.[i] ? (
                          <p className="text-xs text-muted-foreground truncate">
                            ex.: {previewData.amostra[0][i]}
                          </p>
                        ) : null}
                      </div>
                      <Select
                        value={atual ?? IGNORAR}
                        onValueChange={(v) => {
                          setMapeamento((prev) => {
                            const next = { ...prev }
                            const destino = v === IGNORAR ? null : v
                            if (destino) {
                              for (const [k, val] of Object.entries(next)) {
                                if (k !== key && val === destino) next[k] = null
                              }
                            }
                            next[key] = destino
                            return next
                          })
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Ignorar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={IGNORAR}>— Ignorar —</SelectItem>
                          {previewData.camposAlvo.map((c) => (
                            <SelectItem
                              key={c.chave}
                              value={c.chave}
                              disabled={
                                camposUsados.has(c.chave) && atual !== c.chave
                              }
                            >
                              {c.rotulo}
                              {c.obrigatorio ? " *" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </li>
                  )
                })}
              </ul>
            </div>

            {previewData.amostra.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Prévia: {previewData.amostra.length} primeira(s) linha(s) do arquivo.
              </div>
            )}

            {extras}

            <div className="flex flex-wrap gap-2 justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  reset()
                  setPasso("upload")
                }}
              >
                Outro arquivo
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={busy || Boolean(erroMapeamento)}
                onClick={() => void handleImportar()}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                {busy ? "Importando..." : "Confirmar e importar"}
              </Button>
            </div>
          </div>
        )}

        {passo === "resultado" && resultado && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-medium">
                Relatório: {resultado.criados} criado(s) · {resultado.duplicados}{" "}
                duplicado(s) · {resultado.erros} erro(s) · {resultado.total}{" "}
                linha(s)
              </p>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["problemas", "Problemas"],
                    ["erros", "Erros"],
                    ["duplicados", "Duplicados"],
                    ["todos", "Todos"],
                  ] as const
                ).map(([id, label]) => (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={filtro === id ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => setFiltro(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {linhasFiltradas.length > 0 ? (
                <ul className="max-h-48 overflow-auto text-xs space-y-1.5">
                  {linhasFiltradas.map((r) => {
                    const id = rotuloLinha(r)
                    return (
                      <li
                        key={`${r.linha}-${r.status}-${id}`}
                        className="border-b border-border/60 pb-1 last:border-0"
                      >
                        <span className="font-medium">Linha {r.linha}</span>
                        {id ? ` · ${id}` : ""}:{" "}
                        <span
                          className={
                            r.status === "erro"
                              ? "text-destructive"
                              : r.status === "duplicado"
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-emerald-700 dark:text-emerald-400"
                          }
                        >
                          {rotuloStatus(r.status)}
                        </span>
                        {r.motivo ? ` — ${r.motivo}` : ""}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nenhuma linha neste filtro.
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  !resultado.resultados.some((r) => r.status !== "criado")
                }
                onClick={() => baixarProblemasCsv(resultado, titulo)}
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar problemas (CSV)
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset()
                    setPasso("upload")
                  }}
                >
                  Importar outro
                </Button>
                <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
