import request from 'supertest';
import app from '../../src/index';
import { db } from '../../src/repositories/db';
import { patients } from '../../src/repositories/schema';
import { eq } from 'drizzle-orm';

describe('Integration: Search [US2]', () => {
  let p1Id: string;
  let p2Id: string;
  const uniqueId = Date.now();

  beforeAll(async () => {
    // Seed (Bypassing service to create quickly, but ensuring required fields)
    const [p1] = await db.insert(patients).values({
      mrn: `MR-S1-${uniqueId}`,
      name: 'Searchable One',
      birth_date: '1990-01-01',
      gender: 'male',
      national_id: `NIK-S1-${uniqueId}`,
      status: 'active',
      audit_info: {
          created_by_user_id: 'test',
          created_workstation_id: 'test',
          last_updated_by_user_id: 'test',
          last_updated_workstation_id: 'test'
      }
    }).returning();
    p1Id = p1.id;

    const [p2] = await db.insert(patients).values({
      mrn: `MR-S2-${uniqueId}`,
      name: 'Searchable Two',
      birth_date: '1992-02-02',
      gender: 'female',
      national_id: `NIK-S2-${uniqueId}`,
      status: 'active',
      audit_info: {
        created_by_user_id: 'test',
        created_workstation_id: 'test',
        last_updated_by_user_id: 'test',
        last_updated_workstation_id: 'test'
      }
    }).returning();
    p2Id = p2.id;
  });

  afterAll(async () => {
    if (p1Id) await db.delete(patients).where(eq(patients.id, p1Id));
    if (p2Id) await db.delete(patients).where(eq(patients.id, p2Id));
  });

  it('should find patient by name substring', async () => {
    const res = await request(app).get('/v1/patients').query({ name: 'Searchable' });
    expect(res.status).toBe(200);
    // Might be other runs
    const found = res.body.filter((p: any) => p.name.includes('Searchable'));
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it('should find patient by exact MRN', async () => {
    const res = await request(app).get('/v1/patients').query({ mrn: `MR-S1-${uniqueId}` });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(p1Id);
  });
});
