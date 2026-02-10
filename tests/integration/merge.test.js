"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../src/index"));
const db_1 = require("../../src/repositories/db");
const schema_1 = require("../../src/repositories/schema");
const drizzle_orm_1 = require("drizzle-orm");
describe('Integration: Merge [US6]', () => {
    let sourceId;
    let targetId;
    const uniqueId = Date.now();
    beforeAll(async () => {
        const [p1] = await db_1.db.insert(schema_1.patients).values({
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
        const [p2] = await db_1.db.insert(schema_1.patients).values({
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
        if (sourceId)
            await db_1.db.delete(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, sourceId));
        if (targetId)
            await db_1.db.delete(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, targetId));
    });
    it('should merge source into target and update contact info', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
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
        const [source] = await db_1.db.select().from(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, sourceId));
        expect(source.status).toBe('merged');
        expect(source.merged_to_id).toBe(targetId);
        // Verify Target Updated
        const [target] = await db_1.db.select().from(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, targetId));
        // Note: Implementation uses Set to distinct phones, check if both present
        const phones = target.contact_info.phones;
        expect(phones).toContain('08111');
        expect(phones).toContain('08222');
    });
});
//# sourceMappingURL=merge.test.js.map