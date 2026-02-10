import { z } from 'zod';

export const AddressInfoSchema = z.array(z.object({
  type: z.enum(['current', 'permanent']),
  street: z.string(),
  city_id: z.string(),
  postal_code: z.string().optional(),
}));

export const ContactInfoSchema = z.object({
  phones: z.array(z.string()),
  emails: z.array(z.string().email()),
});

export const FamilyInfoSchema = z.object({
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  emergency_contacts: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string().optional(),
  })),
});

export const ClinicalInfoSchema = z.object({
  blood_type: z.enum(['A', 'B', 'AB', 'O']).optional(),
  rhesus: z.enum(['+', '-']).optional(),
});

export const PayerInfoSchema = z.object({
  payer_id: z.string().optional(),
  policy_number: z.string().optional(),
});

export const AuditInfoSchema = z.object({
  created_by_user_id: z.string(),
  created_workstation_id: z.string(),
  created_at: z.string().optional(), // ISO date string
  last_updated_by_user_id: z.string(),
  last_updated_workstation_id: z.string(),
  last_updated_at: z.string().optional(), // ISO date string
});

export type AddressInfo = z.infer<typeof AddressInfoSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type FamilyInfo = z.infer<typeof FamilyInfoSchema>;
export type ClinicalInfo = z.infer<typeof ClinicalInfoSchema>;
export type PayerInfo = z.infer<typeof PayerInfoSchema>;
export type AuditInfo = z.infer<typeof AuditInfoSchema>;
