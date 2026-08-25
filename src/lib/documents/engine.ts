/**
 * Document generation — Lane C, Round 3 (GP-13, M1-3, X-R11, X-R12).
 *
 * Generates a document from an admin-editable template. Two things the brief is
 * explicit about:
 *
 *   - Every render writes a generated_documents row AND snapshots templateVersion
 *     onto it, so a reprint years later matches what was originally issued, not
 *     the template as since edited (ADR 0003).
 *   - The qr_token is 32 random characters — never sequential, never derived
 *     from the licence number or id (X-R11 / X-R12). Generated with crypto,
 *     which is dependency-free.
 *
 * The delivered artifact is print-ready HTML (see render.ts). Turning that HTML
 * into a binary PDF is a SEPARATE, dependency-bearing step — that lives in
 * pdf.ts and is flagged to the lead, because no PDF renderer is an approved
 * dependency for this lane.
 *
 * All work runs inside the caller's `tx` (opened via withUser), so RLS applies.
 */

import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS, renderAuditLabel } from "../audit/actions";

import { assembleDocument } from "./render";

export interface GenerateDocumentInput {
  templateCode: string;
  documentableType?: string | null;
  documentableId?: bigint | null;
  referenceNo?: string | null;
  vars: Record<string, string | undefined>;
  generatedBy?: bigint | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
  pageCode?: string | null;
}

export interface GeneratedDocument {
  id: bigint;
  qrToken: string;
  version: number;
  html: string;
}

export async function generateDocument(
  tx: Prisma.TransactionClient,
  input: GenerateDocumentInput,
): Promise<GeneratedDocument> {
  const tpl = await tx.documentTemplate.findUnique({
    where: { code: input.templateCode, deletedAt: null, active: true },
  });
  if (!tpl) {
    throw new Error(`Templat ${input.templateCode} tidak dijumpai / template not found`);
  }

  const html = assembleDocument(
    {
      headerHtml: tpl.headerHtml,
      bodyHtml: tpl.bodyHtml,
      footerHtml: tpl.footerHtml,
      disclaimerMs: tpl.disclaimerMs,
      disclaimerEn: tpl.disclaimerEn,
    },
    input.vars,
    { paperSize: tpl.paperSize, orientation: tpl.orientation, locale: "ms" },
  );

  const qrToken = randomBytes(16).toString("hex");

  const doc = await tx.generatedDocument.create({
    data: {
      templateCode: tpl.code,
      templateVersion: tpl.version,
      documentableType: input.documentableType ?? null,
      documentableId: input.documentableId ?? null,
      referenceNo: input.referenceNo ?? null,
      // The print-ready HTML is stored; the binary PDF step (pdf.ts) is flagged
      // to the lead pending an approved renderer dependency.
      filePath: `generated/${qrToken}.html`,
      qrToken,
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil ?? null,
      generatedBy: input.generatedBy ?? null,
      generatedAt: new Date(),
    },
  });

  const action = AUDIT_ACTIONS.DOKUMEN_DIJANA;
  await tx.auditLog.create({
    data: {
      userId: input.generatedBy ?? null,
      userNameSnapshot: null,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, {
        subject: tpl.nameMs,
        reference: input.referenceNo ?? undefined,
        actor: input.generatedBy ? String(input.generatedBy) : undefined,
      }),
      actionLabelEn: renderAuditLabel(action.templateEn, {
        subject: tpl.nameEn,
        reference: input.referenceNo ?? undefined,
        actor: input.generatedBy ? String(input.generatedBy) : undefined,
      }),
      auditableType: input.documentableType ?? "generated_document",
      auditableId: doc.id,
      referenceNo: input.referenceNo ?? null,
      moduleCode: action.moduleCode,
      pageCode: input.pageCode ?? null,
    },
  });

  return { id: doc.id, qrToken: doc.qrToken, version: doc.templateVersion, html };
}
