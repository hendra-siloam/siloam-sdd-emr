import request from 'supertest';
import app from '../../src/index';
import { db } from '../../src/repositories/db';
import { patients } from '../../src/repositories/schema';
import { eq } from 'drizzle-orm';

describe('Integration: Merge [US6]', () => {
    let sourceId: string;
    let targetId: string;
    const uniqueId = Date.now();

    beforeAll(async () => {
        const [p1] = await db.insert(patients).values({
            mrn: `MR-M1-${uniqueId}`,
            name: 'Source Patient',
            birth_date: '1990-01-01',
            gender: 'male',
            national_id: `NIK-M1-${uniqueId}`,
            status: 'active',
            contact_info: { phones: ['08111'], emails: [] },
            audit_info: {
                created_by_user_id: 'test',
                created_workstation_id: 'test',
                last_updated_by_user_id: 'test',
                last_updated_workstation_id: 'test'
            }
        }).returning();
        sourceId = p1.id;

        const [p2] = await db.insert(patients).values({
            mrn: `MR-M2-${uniqueId}`,
            name: 'Target Patient',
            birth_date: '1990-01-01',
            gender: 'male',
            national_id: `NIK-M2-${uniqueId}`,
            status: 'active',
            contact_info: { phones: ['08222'], emails: [] },
            audit_info: {
                created_by_user_id: 'test',
                created_workstation_id: 'test',
                last_updated_by_user_id: 'test',
                last_updated_workstation_id: 'test'
            }
        }).returning();
        targetId = p2.id;
    });

    afterAll(async () => {
        if (sourceId) await db.delete(patients).where(eq(patients.id, sourceId));
        if (targetId) await db.delete(patients).where(eq(patients.id, targetId));
    });

    it('should merge source into target and update contact info', async () => {
        const res = await request(app)
            .post('/v1/patients/merge')
            .send({
                targetId,
                sourceId
            })
            .set('x-user-id', 'merger');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.sourceId).toBe(sourceId);

        // Verify Source Merged
        const [source] = await db.select().from(patients).where(eq(patients.id, sourceId));
        expect(source.status).toBe('merged');
        expect(source.merged_to_id).toBe(targetId);

        // Verify Target Updated
        const [target] = await db.select().from(patients).where(eq(patients.id, targetId));
        // Note: Implementation uses Set to distinct phones, check if both present
        const phones = (target.contact_info as any).phones;
        expect(phones).toContain('08111');
        expect(phones).toContain('08222');
    });
});
