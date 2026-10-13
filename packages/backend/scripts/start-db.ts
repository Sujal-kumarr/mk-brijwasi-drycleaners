import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

async function run() {
  const dataDir = path.resolve(__dirname, '../.data/postgres');
  console.log(`Starting Embedded PostgreSQL in ${dataDir}...`);
  
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    persistent: true,
  });

  const fs = await import('fs');
  const pgVersionFile = path.join(dataDir, 'PG_VERSION');
  if (!fs.existsSync(pgVersionFile)) {
    console.log('Initializing cluster for the first time...');
    await pg.initialise();
  } else {
    console.log('Existing cluster found, skipping initialization.');
  }
  await pg.start();
  console.log('PostgreSQL server started on port 5432.');

  try {
    await pg.createDatabase('mk_drycleaners');
    console.log('Database "mk_drycleaners" created or already exists.');
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      console.log('Database "mk_drycleaners" already exists.');
    } else {
      console.log('Database status:', err.message);
    }
  }

  console.log('Ready for Prisma connections!');
  
  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('Stopping Embedded Postgres...');
    await pg.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await pg.stop();
    process.exit(0);
  });

  // Keep alive loop
  setInterval(() => {}, 1000 * 60 * 60);
}

run().catch((err) => {
  console.error('Failed to run embedded postgres:', err);
  process.exit(1);
});
