import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

try {
  const client = await pool.connect()
  console.log('Connected!')
  const result = await client.query('select now()')
  console.log(result.rows)
  client.release()
} catch (e) {
  console.error(e)
}