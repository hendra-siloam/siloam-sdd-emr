import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/repositories/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://siloam:password@localhost:5432/patient_db',
  },
});
