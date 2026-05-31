import { app } from './app.js';
import { seedDatabase } from './db/seed.js';
import { prisma } from './db/client.js';

const port = process.env.PORT || 3001;

app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);

  // Auto-seed on startup if SEED_ON_START=true is set.
  // Set this env var for initial deployment only, then remove it to prevent
  // accidental data wipes on subsequent restarts.
  if (process.env.SEED_ON_START === 'true') {
    console.log('[seeder]: SEED_ON_START detected, seeding database...');
    const start = performance.now();
    try {
      await seedDatabase();
      const duration = performance.now() - start;
      console.log(`[seeder]: Seeding completed in ${duration.toFixed(2)}ms.`);
    } catch (e) {
      console.error('[seeder]: Seeding failed:', e);
    } finally {
      await prisma.$disconnect();
    }
  }
});
