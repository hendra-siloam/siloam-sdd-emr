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
describe('Integration: Patient Registration [US1]', () => {
    let createdPatientId;
    afterAll(async () => {
        // Cleanup
        if (createdPatientId) {
            await db_1.db.delete(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, createdPatientId));
        }
    });
    it('should register a new patient and return 201', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
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
        const stored = await db_1.db.select().from(schema_1.patients).where((0, drizzle_orm_1.eq)(schema_1.patients.id, createdPatientId));
        expect(stored).toHaveLength(1);
        expect(stored[0].name).toBe('Test Patient');
    });
    it('should fail with 400 for invalid input', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/v1/patients')
            .send({
            name: 'Incomplete Patient'
            // Missing required fields
        });
        expect(response.status).toBe(400); // or 500 if validation error isn't caught nicely
    });
});
//# sourceMappingURL=registration.test.js.map