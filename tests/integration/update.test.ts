import request from 'supertest';
import app from '../../src/index';
import { db } from '../../src/repositories/db';
import { patients } from '../../src/repositories/schema';
import { eq } from 'drizzle-orm';

describe('Integration: Update [US3]', () => {
    let pId: string;
    const uniqueId = Date.now();

    beforeAll(async () => {
        const [p] = await db.insert(patients).values({
            mrn: `MR-U-${uniqueId}`,
            name: 'Update Me',
            birth_date: '1980-05-05',
            gender: 'female',
            national_id: `NIK-U-${uniqueId}`,
            status: 'active',
            audit_info: {
                created_by_user_id: 'test',
                created_workstation_id: 'test',
                last_updated_by_user_id: 'test',
                last_updated_workstation_id: 'test'
            }
        }).returning();
        pId = p.id;
    });

    afterAll(async () => {
        if (pId) await db.delete(patients).where(eq(patients.id, pId));
    });

    it('should update address info and return updated object', async () => {
        const res = await request(app)
            .patch(`/v1/patients/${pId}`)
            .send({
                address_info: [
                    { type: 'current', street: 'New Street', city_id: 'JKT' }
                ]
            })
            .set('x-user-id', 'updater');
        
        expect(res.status).toBe(200);
        expect(res.body.address_info).toHaveLength(1);
        expect(res.body.address_info[0].street).toBe('New Street');

        // Verify Persistence
        const [updated] = await db.select().from(patients).where(eq(patients.id, pId));
        expect((updated.address_info as any)[0].street).toBe('New Street');
    });
});
