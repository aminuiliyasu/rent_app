/**
 * Export Rhentify logo SVGs to PNG (run from frontend/: node scripts/export-logo-png.mjs)
 */
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logoDir = join(__dirname, '..', 'public', 'logo')

const exports = [
  { svg: 'rhentify-logo.svg', png: 'rhentify-logo.png', width: 1280, height: 320 },
  { svg: 'rhentify-logo-dark.svg', png: 'rhentify-logo-dark.png', width: 1280, height: 320 },
  { svg: 'rhentify-icon.svg', png: 'rhentify-icon.png', width: 512, height: 512 },
  { svg: 'rhentify-icon-dark.svg', png: 'rhentify-icon-dark.png', width: 512, height: 512 },
]

async function main() {
  const { Resvg } = await import('@resvg/resvg-js')
  if (!existsSync(logoDir)) mkdirSync(logoDir, { recursive: true })

  for (const item of exports) {
    const svgPath = join(logoDir, item.svg)
    const pngPath = join(logoDir, item.png)
    const svg = readFileSync(svgPath, 'utf8')
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: item.width },
      background: item.svg.includes('dark') && item.svg.includes('icon-dark') ? '#0f172a' : 'transparent',
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()
    const fs = await import('fs/promises')
    await fs.writeFile(pngPath, pngBuffer)
    console.log(`Wrote ${item.png} (${item.width}px wide)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
