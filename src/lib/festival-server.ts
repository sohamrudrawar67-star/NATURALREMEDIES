import 'server-only'
import { pool } from './db'
import { FestivalConfig, DEFAULT_FESTIVAL_CONFIG } from './festival'

const SETTING_KEY = 'festival_config'

export async function getFestivalConfig(): Promise<FestivalConfig> {
  try {
    const { rows } = await pool.query<{ value: FestivalConfig }>(
      'select value from site_setting where key = $1',
      [SETTING_KEY]
    )
    if (rows.length && rows[0].value) {
      return {
        ...DEFAULT_FESTIVAL_CONFIG,
        ...rows[0].value,
      }
    }
  } catch (error) {
    console.error('[getFestivalConfig]', error)
  }
  return DEFAULT_FESTIVAL_CONFIG
}

export async function saveFestivalConfig(config: FestivalConfig): Promise<void> {
  await pool.query(
    `insert into site_setting (key, value, updated_at)
     values ($1, $2, now())
     on conflict (key) do update
     set value = $2, updated_at = now()`,
    [SETTING_KEY, JSON.stringify(config)]
  )
}
