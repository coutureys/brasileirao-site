import { sql, setupTables } from '../../lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
  try {
    await setupTables()

    const { season = new Date().getFullYear(), name } = req.query

    let rows
    if (name) {
      rows = await sql`
        SELECT * FROM teams
        WHERE season = ${Number(season)}
          AND competition = 'brasileirao-serie-a'
          AND name ILIKE ${'%'+name+'%'}
        ORDER BY position ASC
      `
    } else {
      rows = await sql`
        SELECT * FROM teams
        WHERE season = ${Number(season)} AND competition = 'brasileirao-serie-a'
        ORDER BY position ASC
      `
    }

    res.json({ data: rows, total: rows.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
