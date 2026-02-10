import { pgTable, uuid, varchar, date, boolean, timestamp, jsonb, bigint, text } from 'drizzle-orm/pg-core';
import { AddressInfo, ContactInfo, FamilyInfo, ClinicalInfo, PayerInfo, AuditInfo } from '../models/types';

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  mrn: varchar('mrn', { length: 20 }).notNull().unique(),
  national_id: varchar('national_id', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  birth_date: date('birth_date').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(), // 'male' | 'female'
  photo_url: text('photo_url'),
  is_deceased: boolean('is_deceased').default(false),
  deceased_date: timestamp('deceased_date'),
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'merged', 'deleted'
  merged_to_id: uuid('merged_to_id'), // FK reference managed manually or strictly if self-referencing issues allow
  
  address_info: jsonb('address_info').$type<AddressInfo>().default([]),
  contact_info: jsonb('contact_info').$type<ContactInfo>().default({ phones: [], emails: [] }),
  family_info: jsonb('family_info').$type<FamilyInfo>().default({ emergency_contacts: [] }),
  clinical_info: jsonb('clinical_info').$type<ClinicalInfo>().default({}),
  payer_info: jsonb('payer_info').$type<PayerInfo>().default({}),
  audit_info: jsonb('audit_info').$type<AuditInfo>().default({ 
      created_by_user_id: 'system', 
      created_workstation_id: 'system', 
      last_updated_by_user_id: 'system', 
      last_updated_workstation_id: 'system' 
  }),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const idSequences = pgTable('id_sequences', {
  key: varchar('key', { length: 50 }).primaryKey(),
  current_val: bigint('current_val', { mode: 'number' }).notNull().default(0),
});
