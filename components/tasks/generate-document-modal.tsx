"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles } from "lucide-react"
import { AiDisclaimer } from "@/components/ai-disclaimer"
import { useToast } from "@/hooks/use-toast"
import {
  modelosDocumentoApi,
  type ModeloDocumentoApi,
} from "@/lib/modelos-documento-api"
import { peticoesApi } from "@/lib/peticoes-api"

interface GenerateDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  processoId: string
  processoTitulo?: string | null
  onSaved: () => void
}

export function GenerateDocumentModal({
  isOpen,
  onClose,
  processoId,
  processoTitulo,
  onSaved,
}: GenerateDocumentModalProps) {
  const { toast } = useToast()
  const [modelos, setModelos] = useState<ModeloDocumentoApi[]>([])
  const [modeloId, setModeloId] = useState("")
  const [texto, setTexto] = useState("")
  const [nomeArquivo, setNomeArquivo] = useState("")
  const [loadingModelos, setLoadingModelos] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setTexto("")
    setModeloId("")
    setNomeArquivo("")
    setLoadingModelos(true)
    void modelosDocumentoApi
      .listar()
      .then((lista) => {
        setModelos(lista)
        if (lista[0]) {
          setModeloId(lista[0].id)
          setNomeArquivo(
            `${lista[0].categoria} - ${processoTitulo?.trim() || "caso"}`,
          )
        }
      })
      .catch((error) => {
        toast({
          title: "Erro ao carregar modelos",
          description:
            error instanceof Error ? error.message : "Não foi possível listar os modelos",
          variant: "destructive",
        })
      })
      .finally(() => setLoadingModelos(false))
  }, [isOpen, processoTitulo, toast])

  const onModeloChange = (id: string) => {
    setModeloId(id)
    const modelo = modelos.find((m) => m.id === id)
    if (modelo) {
      setNomeArquivo(`${modelo.categoria} - ${processoTitulo?.trim() || "caso"}`)
    }
  }

  const handleGerar = async () => {
    if (!modeloId) {
      toast({
        title: "Selecione um modelo",
        variant: "destructive",
      })
      return
    }
    setGerando(true)
    try {
      const result = await peticoesApi.gerar({ modeloId, processoId })
      setTexto(result.texto)
      toast({ title: "Rascunho gerado", description: "Revise o texto antes de salvar." })
    } catch (error) {
      toast({
        title: "Erro ao gerar com IA",
        description:
          error instanceof Error ? error.message : "Falha na geração do rascunho",
        variant: "destructive",
      })
    } finally {
      setGerando(false)
    }
  }

  const handleSalvar = async () => {
    if (!texto.trim()) {
      toast({
        title: "Gere ou edite o texto antes de salvar",
        variant: "destructive",
      })
      return
    }
    if (!nomeArquivo.trim()) {
      toast({
        title: "Informe o nome do arquivo",
        variant: "destructive",
      })
      return
    }
    setSalvando(true)
    try {
      await peticoesApi.salvar({
        processoId,
        nomeArquivo: nomeArquivo.trim(),
        texto,
      })
      toast({ title: "Documento salvo no processo" })
      onSaved()
      onClose()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error ? error.message : "Não foi possível salvar o PDF",
        variant: "destructive",
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !gerando && !salvando && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar documento com IA
          </DialogTitle>
        </DialogHeader>

        <AiDisclaimer>
          Rascunho gerado por IA — revise cuidadosamente antes de usar. Não
          substitui a análise de um advogado.
        </AiDisclaimer>

        <div className="space-y-4 py-1">
          {loadingModelos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : modelos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum modelo cadastrado. Crie um em <strong>Modelos</strong> no menu.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="gerar-modelo">Modelo</Label>
                <select
                  id="gerar-modelo"
                  value={modeloId}
                  onChange={(e) => onModeloChange(e.target.value)}
                  disabled={gerando || salvando}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.categoria} — {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={() => void handleGerar()} disabled={!modeloId || gerando || salvando}>
                {gerando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1" />
                )}
                {gerando ? "Gerando com IA…" : "Gerar com IA"}
              </Button>

              {texto ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="rascunho-texto">Rascunho (editável)</Label>
                    <Textarea
                      id="rascunho-texto"
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      className="min-h-[280px] font-mono text-sm"
                      disabled={salvando}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rascunho-nome">Nome do arquivo</Label>
                    <Input
                      id="rascunho-nome"
                      value={nomeArquivo}
                      onChange={(e) => setNomeArquivo(e.target.value)}
                      placeholder="Petição - Caso.pdf"
                      disabled={salvando}
                    />
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={gerando || salvando}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSalvar()}
            disabled={!texto.trim() || salvando || gerando}
          >
            {salvando ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Salvar como documento do processo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
