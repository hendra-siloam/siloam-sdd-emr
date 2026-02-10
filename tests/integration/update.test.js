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
describe('Integration: Update [US3]', () => {
    let pId;
    const uniqueId = Date.now();
    beforeAll(async () => {
        const [p] = await db_1.db.insert(schema_1.patients).values({
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
        if (pId)
            await db_1.db.delete(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, pId));
    });
    it('should update address info and return updated object', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
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
        const [updated] = await db_1.db.select().from(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, pId));
        expect(updated.address_info[0].street).toBe('New Street');
    });
});
//# sourceMappingURL=update.test.js.map