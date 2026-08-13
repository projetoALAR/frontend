import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center bg-background">
      <h1 className="text-xl font-semibold text-foreground">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Esse endereço não existe no Alar. Confira o link ou volte ao painel.
      </p>
      <Button asChild>
        <Link href="/">Ir ao painel</Link>
      </Button>
    </div>
  )
}
