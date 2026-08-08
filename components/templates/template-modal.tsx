"use client"

import { useEffect, useRef, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import {
  CATEGORIAS_MODELO,
  PLACEHOLDERS_DISPONIVEIS,
  type ModeloDocumentoApi,
  type ModeloDocumentoFormData,
} from "@/lib/modelos-documento-api"

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ModeloDocumentoFormData) => Promise<void>
  modelo?: ModeloDocumentoApi | null
  isEditing?: boolean
}

export function TemplateModal({
  isOpen,
  onClose,
  onSave,
  modelo,
  isEditing,
}: TemplateModalProps) {
  const { toast } = useToast()
  const [nome, setNome] = useState("")
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_MODELO[0])
  const [conteudo, setConteudo] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isOpen) return
    if (modelo) {
      setNome(modelo.nome)
      setCategoria(modelo.categoria)
      setConteudo(modelo.conteudo)
    } else {
      setNome("")
      setCategoria(CATEGORIAS_MODELO[0])
      setConteudo(
        "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO\n\n" +
          "{{cliente.nome}}, inscrito(a) no CPF sob o nº {{cliente.cpf}}, " +
          "e-mail {{cliente.email}}, telefone {{cliente.telefone}}, " +
          "vem, respeitosamente, perante Vossa Excelência, nos autos do processo " +
          "nº {{processo.numero}} ({{processo.titulo}}), expor e requerer o que segue.\n\n" +
          "I — DOS FATOS\n\n" +
          "{{processo.descricao}}\n\n" +
          "II — DO DIREITO\n\n" +
          "[Desenvolver fundamentação jurídica]\n\n" +
          "III — DOS PEDIDOS\n\n" +
          "Diante do exposto, requer-se a procedência dos pedidos.\n\n" +
          "Local, {{data.hoje}}.\n\n" +
          "_______________________________\nAdvogado(a)",
      )
    }
    setErrors({})
  }, [isOpen, modelo])

  const inserirPlaceholder = (token: string) => {
    const el = textareaRef.current
    if (!el) {
      setConteudo((prev) => `${prev}${token}`)
      return
    }
    const start = el.selectionStart ?? conteudo.length
    const end = el.selectionEnd ?? conteudo.length
    const next = conteudo.slice(0, start) + token + conteudo.slice(end)
    setConteudo(next)
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + token.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    if (!nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (nome.trim().length > 120) newErrors.nome = "Máximo de 120 caracteres"
    if (!categoria) newErrors.categoria = "Categoria é obrigatória"
    if (!conteudo.trim()) newErrors.conteudo = "Conteúdo é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        nome: nome.trim(),
        categoria,
        conteudo,
      })
      toast({
        title: "Sucesso!",
        description: isEditing
          ? "Modelo atualizado com sucesso"
          : "Modelo criado com sucesso",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error ? error.message : "Não foi possível salvar o modelo",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>{isEditing ? "Editar modelo" : "Novo modelo"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 min-h-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="modelo-nome">Nome *</Label>
              <Input
                id="modelo-nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (errors.nome) setErrors({ ...errors, nome: "" })
                }}
                placeholder="Ex: Petição inicial cível"
                className={`mt-1 ${errors.nome ? "border-destructive" : ""}`}
                disabled={isSaving}
              />
              {errors.nome && (
                <p className="text-xs text-destructive mt-1">{errors.nome}</p>
              )}
            </div>
            <div>
              <Label htmlFor="modelo-categoria">Categoria *</Label>
              {/* select nativo: evita conflito Radix Select + Dialog (z-index/acentos) */}
              <select
                id="modelo-categoria"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value)
                  if (errors.categoria) setErrors({ ...errors, categoria: "" })
                }}
                disabled={isSaving}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CATEGORIAS_MODELO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-xs text-destructive mt-1">{errors.categoria}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
            <div>
              <Label htmlFor="modelo-conteudo">Conteúdo *</Label>
              <Textarea
                id="modelo-conteudo"
                ref={textareaRef}
                value={conteudo}
                onChange={(e) => {
                  setConteudo(e.target.value)
                  if (errors.conteudo) setErrors({ ...errors, conteudo: "" })
                }}
                placeholder="Digite o texto do modelo. Use placeholders como {{cliente.nome}}."
                className={`mt-1 min-h-[240px] font-mono text-sm ${
                  errors.conteudo ? "border-destructive" : ""
                }`}
                disabled={isSaving}
              />
              {errors.conteudo && (
                <p className="text-xs text-destructive mt-1">{errors.conteudo}</p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-2 h-fit">
              <p className="text-xs font-medium text-muted-foreground">
                Placeholders (clique para inserir na posição do cursor)
              </p>
              <div className="flex flex-col gap-1.5">
                {PLACEHOLDERS_DISPONIVEIS.map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    disabled={isSaving}
                    onClick={() => inserirPlaceholder(ph)}
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-left font-mono text-[11px] hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar modelo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
