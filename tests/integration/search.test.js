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
describe('Integration: Search [US2]', () => {
    let p1Id;
    let p2Id;
    const uniqueId = Date.now();
    beforeAll(async () => {
        // Seed (Bypassing service to create quickly, but ensuring required fields)
        const [p1] = await db_1.db.insert(schema_1.patients).values({
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
        const [p2] = await db_1.db.insert(schema_1.patients).values({
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
        if (p1Id)
            await db_1.db.delete(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, p1Id));
        if (p2Id)
            await db_1.db.delete(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, p2Id));
    });
    it('should find patient by name substring', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/v1/patients').query({ name: 'Searchable' });
        expect(res.status).toBe(200);
        // Might be other runs
        const found = res.body.filter((p) => p.name.includes('Searchable'));
        expect(found.length).toBeGreaterThanOrEqual(2);
    });
    it('should find patient by exact MRN', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/v1/patients').query({ mrn: `MR-S1-${uniqueId}` });
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(p1Id);
    });
});
//# sourceMappingURL=search.test.js.map