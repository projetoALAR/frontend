export type ListaPaginada<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

/**
 * Aceita resposta paginada `{ items, total, ... }` ou array legado.
 * Evita crash `Cannot read properties of undefined (reading 'map')`.
 */
export function normalizarListaPaginada<T>(
  data: unknown,
  page: number,
  limit: number,
): ListaPaginada<T> {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      total: data.length,
      page: 1,
      limit: data.length || limit,
    }
  }
  if (data && typeof data === "object" && Array.isArray((data as ListaPaginada<T>).items)) {
    const d = data as ListaPaginada<T>
    return {
      items: d.items,
      total: typeof d.total === "number" ? d.total : d.items.length,
      page: typeof d.page === "number" ? d.page : page,
      limit: typeof d.limit === "number" ? d.limit : limit,
    }
  }
  return { items: [], total: 0, page, limit }
}
