-- CreateTable
CREATE TABLE "application_types" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reference_prefix" TEXT NOT NULL,
    "form_schema" JSONB NOT NULL,
    "workflow_id" BIGINT,
    "document_template_code" TEXT,
    "fee_amount" DECIMAL(12,2),
    "requires_payment" BOOLEAN NOT NULL DEFAULT false,
    "validity_months" INTEGER,
    "applicant_categories" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" DATE,
    "effective_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "application_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_type_documents" (
    "id" BIGSERIAL NOT NULL,
    "application_type_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "label_ms" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "file_policy_code" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "application_type_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "reference_no" TEXT,
    "application_type_id" BIGINT NOT NULL,
    "applicant_user_id" BIGINT NOT NULL,
    "applicant_organisation_id" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "current_stage_id" BIGINT,
    "form_data" JSONB NOT NULL DEFAULT '{}',
    "last_completed_step" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3),
    "decided_at" TIMESTAMP(3),
    "decision" TEXT,
    "decision_remarks" TEXT,
    "valid_from" DATE,
    "valid_until" DATE,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" BIGINT,
    "cancel_reason" TEXT,
    "frozen_at" TIMESTAMP(3),
    "frozen_by" BIGINT,
    "freeze_reason" TEXT,
    "location_description" TEXT,
    "location_lat" DECIMAL(10,7),
    "location_lng" DECIMAL(10,7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_documents" (
    "id" BIGSERIAL NOT NULL,
    "application_id" BIGINT NOT NULL,
    "requirement_code" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size_kb" INTEGER NOT NULL,
    "uploaded_by" BIGINT NOT NULL,
    "replaced_by_id" BIGINT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_stages" (
    "id" BIGSERIAL NOT NULL,
    "workflow_id" BIGINT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "actor_role_id" BIGINT,
    "actor_internal_unit_id" BIGINT,
    "action_type" TEXT NOT NULL,
    "sla_days" INTEGER,
    "allow_return" BOOLEAN NOT NULL DEFAULT true,
    "allow_amend" BOOLEAN NOT NULL DEFAULT false,
    "min_approvals" INTEGER NOT NULL DEFAULT 1,
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "on_approve_status" TEXT,
    "on_reject_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workflow_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" BIGSERIAL NOT NULL,
    "from_stage_id" BIGINT NOT NULL,
    "to_stage_id" BIGINT,
    "action" TEXT NOT NULL,
    "condition" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_stage_logs" (
    "id" BIGSERIAL NOT NULL,
    "application_id" BIGINT NOT NULL,
    "workflow_stage_id" BIGINT NOT NULL,
    "actor_user_id" BIGINT,
    "actor_name_snapshot" TEXT,
    "actor_role_snapshot" TEXT,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "attachments" JSONB,
    "acted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sla_due_at" TIMESTAMP(3),
    "sla_met" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_stage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licences" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "application_id" BIGINT NOT NULL,
    "licence_no" TEXT NOT NULL,
    "application_type_id" BIGINT NOT NULL,
    "holder_user_id" BIGINT NOT NULL,
    "holder_organisation_id" BIGINT,
    "holder_name_snapshot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issued_at" TIMESTAMP(3) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_until" DATE NOT NULL,
    "generated_document_id" BIGINT,
    "suspended_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "licences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licence_renewals" (
    "id" BIGSERIAL NOT NULL,
    "licence_id" BIGINT NOT NULL,
    "renewal_application_id" BIGINT NOT NULL,
    "previous_valid_until" DATE NOT NULL,
    "new_valid_until" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "licence_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_types_code_key" ON "application_types"("code");

-- CreateIndex
CREATE INDEX "application_types_category_active_idx" ON "application_types"("category", "active");

-- CreateIndex
CREATE UNIQUE INDEX "application_type_documents_application_type_id_code_key" ON "application_type_documents"("application_type_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "applications_uuid_key" ON "applications"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "applications_reference_no_key" ON "applications"("reference_no");

-- CreateIndex
CREATE INDEX "applications_status_application_type_id_idx" ON "applications"("status", "application_type_id");

-- CreateIndex
CREATE INDEX "applications_applicant_user_id_idx" ON "applications"("applicant_user_id");

-- CreateIndex
CREATE INDEX "applications_submitted_at_idx" ON "applications"("submitted_at");

-- CreateIndex
CREATE INDEX "application_documents_application_id_requirement_code_idx" ON "application_documents"("application_id", "requirement_code");

-- CreateIndex
CREATE UNIQUE INDEX "workflows_code_key" ON "workflows"("code");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_stages_workflow_id_sequence_key" ON "workflow_stages"("workflow_id", "sequence");

-- CreateIndex
CREATE INDEX "workflow_transitions_from_stage_id_action_idx" ON "workflow_transitions"("from_stage_id", "action");

-- CreateIndex
CREATE INDEX "application_stage_logs_application_id_acted_at_idx" ON "application_stage_logs"("application_id", "acted_at");

-- CreateIndex
CREATE INDEX "application_stage_logs_workflow_stage_id_sla_met_idx" ON "application_stage_logs"("workflow_stage_id", "sla_met");

-- CreateIndex
CREATE UNIQUE INDEX "licences_uuid_key" ON "licences"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "licences_application_id_key" ON "licences"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "licences_licence_no_key" ON "licences"("licence_no");

-- CreateIndex
CREATE INDEX "licences_status_valid_until_idx" ON "licences"("status", "valid_until");

-- CreateIndex
CREATE INDEX "licences_holder_user_id_idx" ON "licences"("holder_user_id");

-- AddForeignKey
ALTER TABLE "application_types" ADD CONSTRAINT "application_types_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_type_documents" ADD CONSTRAINT "application_type_documents_application_type_id_fkey" FOREIGN KEY ("application_type_id") REFERENCES "application_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_application_type_id_fkey" FOREIGN KEY ("application_type_id") REFERENCES "application_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_current_stage_id_fkey" FOREIGN KEY ("current_stage_id") REFERENCES "workflow_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_from_stage_id_fkey" FOREIGN KEY ("from_stage_id") REFERENCES "workflow_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_to_stage_id_fkey" FOREIGN KEY ("to_stage_id") REFERENCES "workflow_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_stage_logs" ADD CONSTRAINT "application_stage_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_stage_logs" ADD CONSTRAINT "application_stage_logs_workflow_stage_id_fkey" FOREIGN KEY ("workflow_stage_id") REFERENCES "workflow_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licences" ADD CONSTRAINT "licences_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licences" ADD CONSTRAINT "licences_application_type_id_fkey" FOREIGN KEY ("application_type_id") REFERENCES "application_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licence_renewals" ADD CONSTRAINT "licence_renewals_licence_id_fkey" FOREIGN KEY ("licence_id") REFERENCES "licences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
