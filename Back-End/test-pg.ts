import 'dotenv/config';
import pg from 'pg';

async function testPg() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Connecting to PostgreSQL using pg driver...');
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful! Current time from DB:', res.rows[0].now);
  } catch (error) {
    console.error('Connection failed using pg driver!');
    console.error(error);
  } finally {
    await pool.end();
  }
}

testPg();
