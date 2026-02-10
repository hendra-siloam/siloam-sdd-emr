CREATE TABLE "id_sequences" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"current_val" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mrn" varchar(20) NOT NULL,
	"national_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"birth_date" date NOT NULL,
	"gender" varchar(10) NOT NULL,
	"photo_url" text,
	"is_deceased" boolean DEFAULT false,
	"deceased_date" timestamp,
	"status" varchar(20) DEFAULT 'active',
	"merged_to_id" uuid,
	"address_info" jsonb DEFAULT '[]'::jsonb,
	"contact_info" jsonb DEFAULT '{"phones":[],"emails":[]}'::jsonb,
	"family_info" jsonb DEFAULT '{"emergency_contacts":[]}'::jsonb,
	"clinical_info" jsonb DEFAULT '{}'::jsonb,
	"payer_info" jsonb DEFAULT '{}'::jsonb,
	"audit_info" jsonb DEFAULT '{"created_by_user_id":"system","created_workstation_id":"system","last_updated_by_user_id":"system","last_updated_workstation_id":"system"}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "patients_mrn_unique" UNIQUE("mrn"),
	CONSTRAINT "patients_national_id_unique" UNIQUE("national_id")
);
