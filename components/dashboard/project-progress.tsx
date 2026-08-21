"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"

export function ProjectProgress() {
  const { data } = useDashboardResumo()
  const targetProgress = data?.percentualConclusao ?? 0
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
  }, [targetProgress])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < targetProgress) {
        setProgress((prev) => Math.min(prev + 1, targetProgress))
      }
    }, 30)
    return () => clearTimeout(timer)
  }, [progress, targetProgress])

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <Card className="overflow-hidden border-border/80 p-5 gap-4">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Progresso geral
      </h2>
      <div className="flex flex-col items-center">
        <div className="relative mb-3 h-36 w-36">
          <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/30" />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{progress}%</span>
            <span className="text-xs text-muted-foreground mt-1">Concluídos</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">Concluído ({data?.processosConcluidos ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">Em Andamento ({data?.processosAtivos ?? 0})</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
