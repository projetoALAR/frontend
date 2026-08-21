"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { Loader2, Sparkles, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AiDisclaimer } from "@/components/ai-disclaimer"
import { clientesApi, type ClienteCard, type ClienteFormData, type ClienteTipo } from "@/lib/clientes-api"
import { maskCep, maskCnpj, maskCpf, maskPhone, onlyDigits } from "@/lib/masks"
import { validarCnpj, validarCpf } from "@/lib/documento-br"

const EXTRACAO_MIME_ALLOWLIST = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clientData: ClienteFormData) => Promise<void>
  clientData?: ClienteCard | null
  isEditing?: boolean
}

export function ClientModal({ isOpen, onClose, onSave, clientData, isEditing }: ClientModalProps) {
  const { toast } = useToast()
  const [tipo, setTipo] = useState<ClienteTipo>("PF")
  const [name, setName] = useState("")
  const [nomeFantasia, setNomeFantasia] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [rg, setRg] = useState("")
  const [endereco, setEndereco] = useState("")
  const [cidade, setCidade] = useState("")
  const [uf, setUf] = useState("")
  const [cep, setCep] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isExtraindo, setIsExtraindo] = useState(false)
  const [preenchidoPorIa, setPreenchidoPorIa] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && clientData) {
      setTipo(clientData.tipo || "PF")
      setName(clientData.name || "")
      setNomeFantasia(clientData.nomeFantasia || "")
      setEmail(clientData.email || "")
      setPhone(maskPhone(clientData.phone || ""))
      setCpf(maskCpf(clientData.cpf || ""))
      setCnpj(maskCnpj(clientData.cnpj || ""))
      setRg(clientData.rg || "")
      setEndereco(clientData.endereco || "")
      setCidade(clientData.cidade || "")
      setUf(clientData.uf || "")
      setCep(maskCep(clientData.cep || ""))
      setObservacoes(clientData.observacoes || "")
      setErrors({})
      setPreenchidoPorIa(false)
    } else if (isOpen) {
      setTipo("PF")
      setName("")
      setNomeFantasia("")
      setEmail("")
      setPhone("")
      setCpf("")
      setCnpj("")
      setRg("")
      setEndereco("")
      setCidade("")
      setUf("")
      setCep("")
      setObservacoes("")
      setErrors({})
      setPreenchidoPorIa(false)
    }
  }, [isOpen, clientData])

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value)
  }

  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    e.target.value = ""
    if (!arquivo) return

    if (!EXTRACAO_MIME_ALLOWLIST.includes(arquivo.type)) {
      toast({
        title: "Formato não suportado",
        description: "Envie um PDF, JPG, PNG ou WEBP.",
        variant: "destructive",
      })
      return
    }

    setIsExtraindo(true)
    try {
      const dados = await clientesApi.extrairDados(arquivo)

      if (dados.avisos?.includes("pdf_sem_texto")) {
        toast({
          title: "Não consegui ler esse PDF",
          description: "Parece ser um PDF escaneado sem texto. Tente enviar uma foto ou print do documento.",
          variant: "destructive",
        })
        return
      }
      if (dados.avisos?.includes("ia_resposta_invalida")) {
        toast({
          title: "Não consegui extrair os dados",
          description: "A IA não conseguiu ler esse documento com segurança. Preencha manualmente.",
          variant: "destructive",
        })
        return
      }

      if (dados.tipo === "PF" || dados.tipo === "PJ") setTipo(dados.tipo)
      if (dados.nome) setName(dados.nome)
      if (dados.nomeFantasia) setNomeFantasia(dados.nomeFantasia)
      if (dados.email) setEmail(dados.email)
      if (dados.telefone) setPhone(maskPhone(dados.telefone))
      if (dados.cpf) setCpf(maskCpf(dados.cpf))
      if (dados.cnpj) setCnpj(maskCnpj(dados.cnpj))
      if (dados.rg) setRg(dados.rg)
      if (dados.endereco) setEndereco(dados.endereco)
      if (dados.cidade) setCidade(dados.cidade)
      if (dados.uf) setUf(dados.uf)
      if (dados.cep) setCep(maskCep(dados.cep))
      setErrors({})
      setPreenchidoPorIa(true)

      toast({
        title: "Documento lido",
        description: "Confira os dados preenchidos antes de salvar.",
      })
    } catch (error) {
      toast({
        title: "Erro ao ler o documento",
        description: error instanceof Error ? error.message : "Não foi possível processar o arquivo",
        variant: "destructive",
      })
    } finally {
      setIsExtraindo(false)
    }
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = tipo === "PJ" ? "Razão social é obrigatória" : "Nome é obrigatório"
    const cpfAnon = /^ANON/i.test(cpf.trim())
    const cpfDigits = onlyDigits(cpf)
    const cnpjDigits = onlyDigits(cnpj)
    if (tipo === "PF") {
      if (!cpf.trim()) newErrors.cpf = "CPF é obrigatório"
      else if (!cpfAnon && cpfDigits.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos"
      else if (!cpfAnon && !validarCpf(cpf)) newErrors.cpf = "CPF inválido (dígito verificador)"
    } else if (cnpjDigits.length !== 14) {
      newErrors.cnpj = "CNPJ deve ter 14 dígitos"
    } else if (!validarCnpj(cnpj)) {
      newErrors.cnpj = "CNPJ inválido (dígito verificador)"
    }
    if (email.trim() && !validateEmail(email.trim())) {
      newErrors.email = "Email inválido"
    }
    const phoneDigits = onlyDigits(phone)
    if (phone.trim() && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      newErrors.phone = "Telefone deve ter DDD + 8 ou 9 dígitos"
    }
    const cepDigits = onlyDigits(cep)
    if (cep.trim() && cepDigits.length !== 8) newErrors.cep = "CEP deve ter 8 dígitos"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      const idMap: Record<string, string> = {
        name: "client-name",
        cpf: "client-cpf",
        cnpj: "client-cnpj",
        email: "client-email",
        phone: "client-phone",
        cep: "client-cep",
      }
      const first = Object.keys(newErrors)[0]
      document.getElementById(idMap[first] ?? "client-name")?.focus()
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        nome: name.trim(),
        tipo,
        cpf: tipo === "PF" ? (cpfAnon ? cpf.trim() : cpfDigits) : null,
        cnpj: tipo === "PJ" ? cnpjDigits : null,
        nomeFantasia: tipo === "PJ" ? nomeFantasia.trim() || null : null,
        rg: tipo === "PF" ? rg.trim() || null : null,
        email: email.trim() || undefined,
        telefone: phone.trim() ? maskPhone(phone) : undefined,
        endereco: endereco.trim() || null,
        cidade: cidade.trim() || null,
        uf: uf || null,
        cep: cepDigits || null,
        observacoes: observacoes.trim() || null,
      })

      toast({
        title: "Sucesso!",
        description: isEditing ? "Cliente atualizado com sucesso" : "Cliente criado com sucesso",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o cliente",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!isEditing ? (
            <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={EXTRACAO_MIME_ALLOWLIST.join(",")}
                className="hidden"
                onChange={(e) => void handleArquivoSelecionado(e)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isExtraindo || isSaving}
                onClick={() => fileInputRef.current?.click()}
              >
                {isExtraindo ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1" />
                )}
                {isExtraindo ? "Lendo documento..." : "Preencher automaticamente com um documento"}
              </Button>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Upload className="w-3 h-3" />
                RG, CNH, cartão CNPJ, contrato social... (PDF, JPG, PNG ou WEBP)
              </p>
              {preenchidoPorIa ? (
                <AiDisclaimer compact>
                  Dados preenchidos automaticamente por IA — confira antes de salvar.
                </AiDisclaimer>
              ) : null}
            </div>
          ) : null}

          <div>
            <Label>Tipo *</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={tipo === "PF" ? "default" : "outline"}
                className={tipo !== "PF" ? "bg-transparent" : ""}
                disabled={isSaving}
                onClick={() => setTipo("PF")}
              >
                Pessoa física
              </Button>
              <Button
                type="button"
                variant={tipo === "PJ" ? "default" : "outline"}
                className={tipo !== "PJ" ? "bg-transparent" : ""}
                disabled={isSaving}
                onClick={() => setTipo("PJ")}
              >
                Pessoa jurídica
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="client-name">{tipo === "PJ" ? "Razão social *" : "Nome *"}</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              placeholder={tipo === "PJ" ? "Ex: Silva Advogados Ltda" : "Ex: Matheus Silva"}
              className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
              disabled={isSaving}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "client-name-error" : undefined}
            />
            {errors.name && (
              <p id="client-name-error" role="alert" className="text-xs text-destructive mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {tipo === "PJ" ? (
            <>
              <div>
                <Label htmlFor="client-fantasia">Nome fantasia</Label>
                <Input
                  id="client-fantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Ex: Silva Advocacia"
                  className="mt-1"
                  disabled={isSaving}
                />
              </div>
              <div>
                <Label htmlFor="client-cnpj">CNPJ *</Label>
                <MaskedInput
                  id="client-cnpj"
                  mask="cnpj"
                  value={cnpj}
                  onValueChange={(v) => {
                    setCnpj(v)
                    if (errors.cnpj) setErrors({ ...errors, cnpj: "" })
                  }}
                  placeholder="00.000.000/0000-00"
                  className={`mt-1 font-mono ${errors.cnpj ? "border-destructive" : ""}`}
                  disabled={isSaving}
                  aria-invalid={!!errors.cnpj}
                  aria-describedby={errors.cnpj ? "client-cnpj-error" : undefined}
                />
                {errors.cnpj && (
                  <p id="client-cnpj-error" role="alert" className="text-xs text-destructive mt-1">
                    {errors.cnpj}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="client-cpf">CPF *</Label>
                <MaskedInput
                  id="client-cpf"
                  mask="cpf"
                  value={cpf}
                  onValueChange={(v) => {
                    setCpf(v)
                    if (errors.cpf) setErrors({ ...errors, cpf: "" })
                  }}
                  placeholder="000.000.000-00"
                  className={`mt-1 font-mono ${errors.cpf ? "border-destructive" : ""}`}
                  disabled={isSaving}
                  aria-invalid={!!errors.cpf}
                  aria-describedby={errors.cpf ? "client-cpf-error" : undefined}
                />
                {errors.cpf && (
                  <p id="client-cpf-error" role="alert" className="text-xs text-destructive mt-1">
                    {errors.cpf}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="client-rg">RG</Label>
                <Input
                  id="client-rg"
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  placeholder="Opcional"
                  className="mt-1"
                  disabled={isSaving}
                  maxLength={20}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
                placeholder="Ex: contato@email.com"
                className={`mt-1 ${errors.email ? "border-destructive" : ""}`}
                disabled={isSaving}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="client-phone">Telefone</Label>
              <MaskedInput
                id="client-phone"
                mask="phone"
                value={phone}
                onValueChange={(v) => {
                  setPhone(v)
                  if (errors.phone) setErrors({ ...errors, phone: "" })
                }}
                placeholder="(11) 99999-9999"
                className={`mt-1 font-mono ${errors.phone ? "border-destructive" : ""}`}
                disabled={isSaving}
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="client-endereco">Endereço</Label>
            <Input
              id="client-endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, complemento"
              className="mt-1"
              disabled={isSaving}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <Label htmlFor="client-cidade">Cidade</Label>
              <Input
                id="client-cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="mt-1"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label>UF</Label>
              <Select value={uf || undefined} onValueChange={setUf} disabled={isSaving}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((sigla) => (
                    <SelectItem key={sigla} value={sigla}>
                      {sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-cep">CEP</Label>
              <MaskedInput
                id="client-cep"
                mask="cep"
                value={cep}
                onValueChange={(v) => {
                  setCep(v)
                  if (errors.cep) setErrors({ ...errors, cep: "" })
                }}
                placeholder="00000-000"
                className={`mt-1 font-mono ${errors.cep ? "border-destructive" : ""}`}
                disabled={isSaving}
              />
              {errors.cep && <p className="text-xs text-destructive mt-1">{errors.cep}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="client-obs">Observações internas</Label>
            <Textarea
              id="client-obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações visíveis só para a equipe"
              rows={3}
              maxLength={2000}
              className="mt-1"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent" disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
