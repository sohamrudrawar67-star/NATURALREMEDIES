import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE_NAME } from '@/lib/site'

export const alt = `${SITE_NAME}: good things, kept simple`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), 'public/logo.png'))).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'radial-gradient(120% 90% at 50% 0%, #f4f1ea 0%, #fbfbf9 60%)',
          color: '#1d1d1f',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', width: 84, height: 84, borderRadius: 84, background: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={74} height={67} alt="" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}>Good things,</div>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -5, lineHeight: 1.05, color: '#4a7424' }}>kept simple.</div>
          <div style={{ marginTop: 28, fontSize: 34, color: '#6e6e73' }}>A small homegrown brand · Order on WhatsApp · Free delivery</div>
        </div>
      </div>
    ),
    size
  )
}
