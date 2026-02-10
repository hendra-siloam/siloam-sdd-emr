import request from 'supertest';
import app from '../../src/index';
import { db } from '../../src/repositories/db';
import { patients } from '../../src/repositories/schema';
import { eq } from 'drizzle-orm';

describe('Integration: Patient Registration [US1]', () => {
  let createdPatientId: string;

  afterAll(async () => {
    // Cleanup
    if (createdPatientId) {
      await db.delete(patients).where(eq(patients.id, createdPatientId));
    }
  });

  it('should register a new patient and return 201', async () => {
    const response = await request(app)
      .post('/v1/patients')
      .send({
        name: 'Test Patient',
        birth_date: '1990-01-01',
        gender: 'male',
        national_id: `NIK-${Date.now()}`, // Ensure uniqueness
        address_info: [],
        contact_info: { phones: [], emails: [] }
      })
      .set('x-user-id', 'test-user')
      .set('x-workstation-id', 'test-station');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('mrn');
    expect(response.body.mrn).toMatch(/^MR-\d{6}$/);
    
    createdPatientId = response.body.id;

    // Verify DB persistence
    const stored = await db.select().from(patients).where(eq(patients.id, createdPatientId));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Test Patient');
  });

  it('should fail with 400 for invalid input', async () => {
    const response = await request(app)
      .post('/v1/patients')
      .send({
        name: 'Incomplete Patient'
        // Missing required fields
      });
    
    expect(response.status).toBe(400); // or 500 if validation error isn't caught nicely
  });
});
