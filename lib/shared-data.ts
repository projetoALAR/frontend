export const casesData = [
  {
    id: 1,
    title: "Análise de Contrato - Empresa XYZ",
    name: "Análise de Contrato Comercial - Empresa XYZ",
    project: "Direito Comercial",
    priority: "Alta",
    dueDate: "24 Nov, 2025",
    completed: false,
    tags: ["Contrato", "Comercial"],
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Parecer Jurídico - Questão Trabalhista",
    name: "Ação Trabalhista - Indenização",
    project: "Direito do Trabalho",
    priority: "Alta",
    dueDate: "25 Nov, 2025",
    completed: false,
    tags: ["Parecer", "Trabalhista"],
    color: "bg-sky-500",
  },
  {
    id: 3,
    title: "Revisão de Documentação Processual",
    name: "Constituição de Empresa - Startup Tech",
    project: "Poder Judiciário",
    priority: "Média",
    dueDate: "23 Nov, 2025",
    completed: true,
    tags: ["Revisão", "Processo"],
    color: "bg-indigo-500",
  },
  {
    id: 4,
    title: "Preparar Petição Inicial",
    name: "Parecer Jurídico - Direito Civil",
    project: "Ação Cível",
    priority: "Baixa",
    dueDate: "26 Nov, 2025",
    completed: false,
    tags: ["Documentação", "Petição"],
    color: "bg-blue-700",
  },
  {
    id: 5,
    title: "Constituição de Empresa - Startup Tech",
    name: "Recuperação Judicial - Empresa ABC",
    project: "Direito Empresarial",
    priority: "Alta",
    dueDate: "24 Nov, 2025",
    completed: false,
    tags: ["Constituição", "Empresa"],
    color: "bg-cyan-600",
  },
  {
    id: 6,
    title: "Análise de Jurisprudência Relevante",
    project: "Pesquisa Jurídica",
    priority: "Média",
    dueDate: "27 Nov, 2025",
    completed: false,
    tags: ["Pesquisa", "Jurisprudência"],
  },
]

export const getRecentCases = () => {
  return casesData.slice(0, 5).map((c) => ({
    name: c.name || c.title,
    date: c.dueDate,
    color: c.color || "bg-blue-500",
  }))
}

export const getTotalCases = () => {
  return casesData.length
}

export const getCompletedCases = () => {
  return casesData.filter((c) => c.completed).length
}

export const getActiveCases = () => {
  return casesData.filter((c) => !c.completed).length
}

export const getCaseDistribution = () => {
  return {
    active: casesData.filter((c) => !c.completed).length,
    completed: casesData.filter((c) => c.completed).length,
    total: casesData.length,
  }
}

// Retorna os casos com prazo próximo (ativas, ordenadas por data)
export const getUpcomingDeadlines = () => {
  return casesData
    .filter((c) => !c.completed)
    .map((c) => ({ id: c.id, title: c.title, dueDate: c.dueDate, project: c.project }))
}

// Percentual de casos concluídos sobre o total
export const getCompletionPercentage = () => {
  if (casesData.length === 0) return 0
  return Math.round((casesData.filter((c) => c.completed).length / casesData.length) * 100)
}

// Retorna dados mensais derivados dos casos (mock realista baseado no total)
export const getMonthlyData = () => {
  const total = casesData.length
  return [
    { month: "Jan", cases: Math.max(1, Math.round(total * 0.6)) },
    { month: "Fev", cases: Math.max(1, Math.round(total * 0.7)) },
    { month: "Mar", cases: Math.max(1, Math.round(total * 0.65)) },
    { month: "Abr", cases: Math.max(1, Math.round(total * 0.85)) },
    { month: "Mai", cases: Math.max(1, Math.round(total * 0.75)) },
    { month: "Jun", cases: total },
  ]
}
