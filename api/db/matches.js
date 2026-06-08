import { sql, setupTables } from '../../lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    await setupTables()

    const { status, team, season = new Date().getFullYear(), limit = 20, page = 1 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let rows
    if (team) {
      rows = await sql`
        SELECT * FROM matches
        WHERE season = ${Number(season)}
          AND competition = 'brasileirao-serie-a'
          AND (home_name ILIKE ${'%'+team+'%'} OR away_name ILIKE ${'%'+team+'%'})
          ${status ? sql`AND status = ${status.toUpperCase()}` : sql``}
        ORDER BY utc_date DESC
        LIMIT ${Number(limit)} OFFSET ${offset}
      `
    } else if (status) {
      rows = await sql`
        SELECT * FROM matches
        WHERE season = ${Number(season)}
          AND competition = 'brasileirao-serie-a'
          AND status = ${status.toUpperCase()}
        ORDER BY utc_date DESC
        LIMIT ${Number(limit)} OFFSET ${offset}
      `
    } else {
      rows = await sql`
        SELECT * FROM matches
        WHERE season = ${Number(season)} AND competition = 'brasileirao-serie-a'
        ORDER BY utc_date DESC
        LIMIT ${Number(limit)} OFFSET ${offset}
      `
    }

    const [{ count }] = await sql`
      SELECT COUNT(*) FROM matches
      WHERE season = ${Number(season)} AND competition = 'brasileirao-serie-a'
      ${status ? sql`AND status = ${status.toUpperCase()}` : sql``}
    `

    res.json({
      data: rows,
      meta: { total: Number(count), page: Number(page), limit: Number(limit), totalPages: Math.ceil(Number(count) / Number(limit)) },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
