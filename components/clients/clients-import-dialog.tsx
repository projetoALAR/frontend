"use client"

import { ImportMapDialog } from "@/components/shared/import-map-dialog"
import { clientesApi } from "@/lib/clientes-api"

type ClientsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

export function ClientsImportDialog({
  open,
  onOpenChange,
  onImported,
}: ClientsImportDialogProps) {
  return (
    <ImportMapDialog
      open={open}
      onOpenChange={onOpenChange}
      onImported={onImported}
      titulo="Importar clientes"
      descricao="Envie a planilha do escritório (qualquer sistema) ou use o modelo Alar. O mapeamento de colunas evita retrabalho."
      modeloFilename="modelo-clientes-alar.xlsx"
      baixarModelo={() => clientesApi.baixarModeloImportacao()}
      preview={(arquivo) => clientesApi.previewImportacao(arquivo)}
      importar={(arquivo, mapeamento) =>
        clientesApi.importarCsv(arquivo, mapeamento)
      }
      dicaObrigatoria="Obrigatório mapear Nome. CPF/CNPJ podem ser colunas separadas ou uma só (Documento)."
      maxLinhas={500}
    />
  )
}
