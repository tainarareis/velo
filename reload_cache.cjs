const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ymbqlyfioapirdiakfxv:zENKeBSpvsqgpqen@aws-0-ca-central-1.pooler.supabase.com:5432/postgres'
});

async function main() {
  await client.connect();
  const res = await client.query(`NOTIFY pgrst, 'reload schema';`);
  console.log('Reloaded schema cache');
  
  // also let's check if the table exists
  const res2 = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
    );
  `);
  console.log('Orders table exists:', res2.rows[0].exists);
  
  await client.end();
}

main().catch(console.error);
