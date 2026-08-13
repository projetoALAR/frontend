export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  downloadBlob(new Blob([content], { type: `${mimeType};charset=utf-8` }), filename)
}
