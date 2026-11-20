import { toJpeg, toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

const POSTER_SELECTOR = '.poster-a4[data-export="true"]'
const SCALE = 3 // ~300 dpi

function posterEl(): HTMLElement | null {
  return document.querySelector<HTMLElement>(POSTER_SELECTOR)
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export async function exportImage(format: 'png' | 'jpeg') {
  const el = posterEl()
  if (!el) return
  const opts = { pixelRatio: SCALE, backgroundColor: '#ffffff' }
  const dataUrl =
    format === 'png' ? await toPng(el, opts) : await toJpeg(el, { ...opts, quality: 0.95 })
  download(dataUrl, format === 'png' ? 'affiche.png' : 'affiche.jpg')
}

export async function exportPdf() {
  const el = posterEl()
  if (!el) return
  const dataUrl = await toPng(el, { pixelRatio: SCALE })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297)
  pdf.save('affiche.pdf')
}
