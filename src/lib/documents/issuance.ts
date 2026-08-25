/**
 * Licence issuance + public QR verification resolution — OpenCode, Round 6 (F6).
 *
 * issueLicence() runs inside the caller's `tx` (opened via withUser — it
 * writes). It creates the licences row, renders the certificate document,
 * persists a generated_documents row carrying a domain-generated qr_token,
 * links the two, and writes a specific audit action (G3 — never a bare
 * "update").
 *
 * resolveLicenceVerification() is the read side the public /semak page uses.
 * It runs via asAnonymous and returns ONLY what domain publicVerification()
 * permits (X-R12): licence number, type, holder name, validity dates, status.
 * Nothing else — not IC, address, phone, or the application behind it.
 *
 * All work happens in the caller's transaction, so RLS still applies.
 */

import type { Prisma } from "@prisma/client";

import {
  publicVerification,
  type LicenceRecord,
  type PublicVerification,
} from "@/domain/licence/qr-token";

import { AUDIT_ACTIONS, renderAuditLabel } from "../audit/actions";
import { generateDocument } from "./engine";

export const ISSUING_AUTHORITY_MS = "Lembaga Pelabuhan Kemaman (LPKmn)";
export const ISSUING_AUTHORITY_EN = "Kemaman Port Authority";

export interface IssueLicenceInput {
  applicationId: bigint;
  applicationTypeId: bigint;
  licenceNo: string;
  holderUserId: bigint;
  holderOrganisationId?: bigint | null;
  holderNameSnapshot: string;
  templateCode: string;
  templateVars: Record<string, string | undefined>;
  referenceNo?: string | null;
  validFrom: Date;
  validUntil: Date;
  issuedAt?: Date;
  issuedBy: bigint;
}

export interface IssueLicenceResult {
  licenceId: bigint;
  generatedDocumentId: bigint;
  qrToken: string;
  licenceNo: string;
}

export async function issueLicence(
  tx: Prisma.TransactionClient,
  input: IssueLicenceInput,
): Promise<IssueLicenceResult> {
  // 1. Create the licence row first so the document can reference it.
  const licence = await tx.licence.create({
    data: {
      applicationId: input.applicationId,
      applicationTypeId: input.applicationTypeId,
      licenceNo: input.licenceNo,
      holderUserId: input.holderUserId,
      holderOrganisationId: input.holderOrganisationId ?? null,
      holderNameSnapshot: input.holderNameSnapshot,
      status: "active",
      issuedAt: input.issuedAt ?? new Date(),
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      generatedDocumentId: null,
    },
  });

  // 2. Render + persist the certificate document. generateDocument writes the
  //    generated_documents row (qr_token via domain) and the DOKUMEN_DIJANA
  //    audit row, and snaps the template version (ADR 0003).
  const doc = await generateDocument(tx, {
    templateCode: input.templateCode,
    documentableType: "licence",
    documentableId: licence.id,
    referenceNo: input.referenceNo ?? input.licenceNo,
    vars: input.templateVars,
    generatedBy: input.issuedBy,
    validFrom: input.validFrom,
    validUntil: input.validUntil,
    pageCode: "licence-issue",
  });

  // 3. Link the document back to the licence.
  await tx.licence.update({
    where: { id: licence.id },
    data: { generatedDocumentId: doc.id },
  });

  // 4. Audit the issuance with a specific, bilingual action (G3).
  const action = AUDIT_ACTIONS.LESEN_DIKELUARKAN;
  await tx.auditLog.create({
    data: {
      userId: input.issuedBy,
      userNameSnapshot: null,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, {
        subject: input.licenceNo,
        actor: String(input.issuedBy),
      }),
      actionLabelEn: renderAuditLabel(action.templateEn, {
        subject: input.licenceNo,
        actor: String(input.issuedBy),
      }),
      auditableType: "licence",
      auditableId: licence.id,
      referenceNo: input.referenceNo ?? input.licenceNo,
      moduleCode: action.moduleCode,
      pageCode: "licence-issue",
    },
  });

  return {
    licenceId: licence.id,
    generatedDocumentId: doc.id,
    qrToken: doc.qrToken,
    licenceNo: licence.licenceNo,
  };
}

export interface ResolveResult {
  found: boolean;
  token: string;
  verification?: PublicVerification;
}

/**
 * Public, unauthenticated resolution of a QR token (X-R12). The caller must
 * wrap this in asAnonymous(). It deliberately constructs the LicenceRecord
 * field by field from the joined rows and passes it to domain
 * publicVerification(), which enforces the disclosure boundary — the joined
 * rows carry IC/address/phone that this function never copies across.
 */
export async function resolveLicenceVerification(
  tx: Prisma.TransactionClient,
  token: string,
): Promise<ResolveResult> {
  const doc = await tx.generatedDocument.findUnique({ where: { qrToken: token } });
  if (!doc || doc.deletedAt || doc.revokedAt) return { found: false, token };

  const licence = await tx.licence.findFirst({
    where: { generatedDocumentId: doc.id, deletedAt: null },
    include: { applicationType: true },
  });
  if (!licence) return { found: false, token };

  const record: LicenceRecord = {
    licenceNo: licence.licenceNo,
    typeNameMs: licence.applicationType.nameMs,
    typeNameEn: licence.applicationType.nameEn,
    holderNameSnapshot: licence.holderNameSnapshot,
    status: licence.status,
    issuedAt: licence.issuedAt,
    validFrom: licence.validFrom,
    validUntil: licence.validUntil,
    revokedAt: licence.revokedAt,
  };

  const verification = publicVerification(record, new Date());
  if (!verification) return { found: false, token };

  return { found: true, token, verification };
}
