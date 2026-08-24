-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "settings" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "group" TEXT NOT NULL,
    "label_ms" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lookup_types" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "allow_user_request" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lookup_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lookup_values" (
    "id" BIGSERIAL NOT NULL,
    "lookup_type_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "label_ms" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_via" TEXT NOT NULL DEFAULT 'seed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lookup_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_policies" (
    "id" BIGSERIAL NOT NULL,
    "context_code" TEXT NOT NULL,
    "label_ms" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "allowed_extensions" JSONB NOT NULL,
    "allowed_mimes" JSONB NOT NULL,
    "max_size_kb" INTEGER NOT NULL DEFAULT 5120,
    "max_files" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "file_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "user_name_snapshot" TEXT,
    "user_role_snapshot" TEXT,
    "action_code" TEXT NOT NULL,
    "action_label_ms" TEXT NOT NULL,
    "action_label_en" TEXT NOT NULL,
    "auditable_type" TEXT,
    "auditable_id" BIGINT,
    "reference_no" TEXT,
    "workflow_stage_code" TEXT,
    "module_code" TEXT,
    "page_code" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_purge_runs" (
    "id" BIGSERIAL NOT NULL,
    "purged_before" TIMESTAMP(3) NOT NULL,
    "rows_deleted" BIGINT NOT NULL,
    "triggered_by" TEXT NOT NULL,
    "user_id" BIGINT,
    "user_name_snapshot" TEXT,
    "run_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_purge_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "ic_no" TEXT,
    "user_category" TEXT NOT NULL DEFAULT 'external',
    "password_hash" TEXT,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "mfa_secret" TEXT,
    "mfa_enabled_at" TIMESTAMP(3),
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "email_verified_at" TIMESTAMP(3),
    "profile_photo_path" TEXT,
    "last_login_at" TIMESTAMP(3),
    "preferred_locale" TEXT NOT NULL DEFAULT 'ms',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "internal_units" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "parent_id" BIGINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "internal_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_internal_unit" (
    "user_id" BIGINT NOT NULL,
    "internal_unit_id" BIGINT NOT NULL,
    "position" TEXT,
    "is_head" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_internal_unit_pkey" PRIMARY KEY ("user_id","internal_unit_id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_no" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "postcode" TEXT,
    "city" TEXT,
    "state_code" TEXT,
    "country_code" TEXT NOT NULL DEFAULT 'MY',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "verified_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_user" (
    "organisation_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role_in_org" TEXT,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organisation_user_pkey" PRIMARY KEY ("organisation_id","user_id")
);

-- CreateTable
CREATE TABLE "undertaking_versions" (
    "id" BIGSERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "title_ms" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "body_ms" TEXT NOT NULL,
    "body_en" TEXT NOT NULL,
    "template_path" TEXT,
    "effective_from" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "undertaking_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_undertakings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "undertaking_version_id" BIGINT NOT NULL,
    "undertaking_version_snapshot" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_undertakings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "code" TEXT NOT NULL,
    "label_ms" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "route" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_role" (
    "menu_item_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_item_role_pkey" PRIMARY KEY ("menu_item_id","role_id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject_ms" TEXT,
    "subject_en" TEXT,
    "body_ms" TEXT NOT NULL,
    "body_en" TEXT NOT NULL,
    "variables" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_messages" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "template_code" TEXT,
    "channel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "reference_no" TEXT,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "role_id" BIGINT,
    "category" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_broadcasts" (
    "id" BIGSERIAL NOT NULL,
    "title_ms" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "body_ms" TEXT NOT NULL,
    "body_en" TEXT NOT NULL,
    "target_roles" JSONB,
    "target_units" JSONB,
    "channels" JSONB NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notification_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_ms" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "header_html" TEXT,
    "body_html" TEXT NOT NULL,
    "footer_html" TEXT,
    "paper_size" TEXT NOT NULL DEFAULT 'A4',
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "disclaimer_ms" TEXT,
    "disclaimer_en" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "min_access_level" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" BIGSERIAL NOT NULL,
    "template_code" TEXT NOT NULL,
    "template_version" INTEGER NOT NULL,
    "documentable_type" TEXT,
    "documentable_id" BIGINT,
    "reference_no" TEXT,
    "file_path" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "valid_from" DATE,
    "valid_until" DATE,
    "generated_by" BIGINT,
    "generated_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoke_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_idx" ON "settings"("group");

-- CreateIndex
CREATE UNIQUE INDEX "lookup_types_code_key" ON "lookup_types"("code");

-- CreateIndex
CREATE INDEX "lookup_values_lookup_type_id_active_sort_order_idx" ON "lookup_values"("lookup_type_id", "active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "file_policies_context_code_key" ON "file_policies"("context_code");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_auditable_type_auditable_id_idx" ON "audit_logs"("auditable_type", "auditable_id");

-- CreateIndex
CREATE INDEX "audit_logs_module_code_created_at_idx" ON "audit_logs"("module_code", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_reference_no_idx" ON "audit_logs"("reference_no");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_user_category_status_idx" ON "users"("user_category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_group_idx" ON "permissions"("group");

-- CreateIndex
CREATE UNIQUE INDEX "internal_units_code_key" ON "internal_units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organisations_uuid_key" ON "organisations"("uuid");

-- CreateIndex
CREATE INDEX "organisations_type_status_idx" ON "organisations"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "undertaking_versions_version_key" ON "undertaking_versions"("version");

-- CreateIndex
CREATE INDEX "user_undertakings_user_id_accepted_at_idx" ON "user_undertakings"("user_id", "accepted_at");

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_code_key" ON "menu_items"("code");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_code_key" ON "notification_templates"("code");

-- CreateIndex
CREATE INDEX "notification_templates_category_channel_idx" ON "notification_templates"("category", "channel");

-- CreateIndex
CREATE INDEX "notification_messages_user_id_read_at_idx" ON "notification_messages"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notification_messages_status_channel_idx" ON "notification_messages"("status", "channel");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_category_idx" ON "notification_preferences"("user_id", "category");

-- CreateIndex
CREATE INDEX "notification_preferences_role_id_category_idx" ON "notification_preferences"("role_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_code_key" ON "document_templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "generated_documents_qr_token_key" ON "generated_documents"("qr_token");

-- CreateIndex
CREATE INDEX "generated_documents_documentable_type_documentable_id_idx" ON "generated_documents"("documentable_type", "documentable_id");

-- AddForeignKey
ALTER TABLE "lookup_values" ADD CONSTRAINT "lookup_values_lookup_type_id_fkey" FOREIGN KEY ("lookup_type_id") REFERENCES "lookup_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_units" ADD CONSTRAINT "internal_units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "internal_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_internal_unit" ADD CONSTRAINT "user_internal_unit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_internal_unit" ADD CONSTRAINT "user_internal_unit_internal_unit_id_fkey" FOREIGN KEY ("internal_unit_id") REFERENCES "internal_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_user" ADD CONSTRAINT "organisation_user_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_user" ADD CONSTRAINT "organisation_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_undertakings" ADD CONSTRAINT "user_undertakings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_undertakings" ADD CONSTRAINT "user_undertakings_undertaking_version_id_fkey" FOREIGN KEY ("undertaking_version_id") REFERENCES "undertaking_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_role" ADD CONSTRAINT "menu_item_role_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_role" ADD CONSTRAINT "menu_item_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_messages" ADD CONSTRAINT "notification_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
