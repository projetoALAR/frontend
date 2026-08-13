/**
 * Tipos alinhados aos schemas OpenAPI da API Alar (`/docs-json`).
 * Fonte: ClienteRespostaDto, ProcessoRespostaDto, DocumentoRespostaDto, UsuarioAuthDto
 * e DTOs de escrita (CreateClienteDto, CreateProcessoDto, LoginDto).
 */
export type Role = "ADMIN" | "ADVOGADO" | "ASSISTENTE"

export type ClienteCountDto = {
  processos: number
}

export type ClienteRespostaDto = {
  id: string
  nome: string
  cpf: string
  email?: string | null
  telefone?: string | null
  criadoEm: string
  _count?: ClienteCountDto
}

export type CreateClienteDto = {
  nome: string
  cpf: string
  email?: string
  telefone?: string
}

export type UpdateClienteDto = Partial<CreateClienteDto>

export type UsuarioResumoDto = {
  id: string
  nome: string
  email: string
  role: Role
}

export type ProcessoClienteResumoDto = {
  id: string
  nome: string
  email?: string | null
  telefone?: string | null
  cpf?: string
}

export type ProcessoCountDto = {
  documentos: number
  compromissos: number
}

export type ProcessoRespostaDto = {
  id: string
  numero: string
  status: string
  descricao?: string | null
  titulo?: string | null
  prioridade?: string | null
  prazo?: string | null
  tags?: string[] | null
  concluido: boolean
  clienteId: string
  responsavelId?: string | null
  coResponsavelId?: string | null
  responsavel?: UsuarioResumoDto | null
  coResponsavel?: UsuarioResumoDto | null
  criadoEm: string
  atualizadoEm: string
  cliente?: ProcessoClienteResumoDto
  _count?: ProcessoCountDto
}

export type CreateProcessoDto = {
  numero: string
  status: string
  clienteId: string
  titulo?: string
  descricao?: string | null
  prioridade?: string
  prazo?: string | null
  tags?: string[]
  concluido?: boolean
  responsavelId?: string | null
  coResponsavelId?: string | null
}

export type DocumentoRespostaDto = {
  id: string
  nome: string
  urlArquivo: string
  tamanho?: number | null
  criadoEm: string
  processoId: string
}

export type UsuarioAuthDto = {
  id: string
  nome: string
  email: string
  role: Role
  fotoUrl?: string | null
  criadoEm: string
  totpEnabled?: boolean
}

export type LoginDto = {
  email: string
  senha: string
}

export type components = {
  schemas: {
    ClienteRespostaDto: ClienteRespostaDto
    ClienteCountDto: ClienteCountDto
    CreateClienteDto: CreateClienteDto
    UpdateClienteDto: UpdateClienteDto
    ProcessoRespostaDto: ProcessoRespostaDto
    CreateProcessoDto: CreateProcessoDto
    DocumentoRespostaDto: DocumentoRespostaDto
    UsuarioAuthDto: UsuarioAuthDto
    UsuarioResumoDto: UsuarioResumoDto
    LoginDto: LoginDto
  }
}
