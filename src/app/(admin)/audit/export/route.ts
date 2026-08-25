import { NextRequest, NextResponse } from "next/server";
import { userHasPermission } from "@/lib/rbac/roles.service";
import { queryAuditLogs, type AuditFilter } from "../query";
import { auditColumnHeaders } from "@/lib/exports/audit";
import { toMatrix } from "@/lib/exports/shapes";
import { rowsToExcelBuffer } from "@/lib/exports/excel";
import { rowsToWordBuffer } from "@/lib/exports/word";
import { buildReportHtml } from "@/lib/exports/pdf";

/**
 * POST /audit/export  ->  returns the current filtered view as xlsx / docx /
 * html. Scope is bound by withUser; the filter (year/quarter/search) can only
 * narrow what the viewer is already allowed to see, never widen the tenant
 * scope. The caller cannot pass a different userId.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = await currentUserId();
  if (!(await userHasPermission(userId, "AUDIT_EXPORT"))) {
    return NextResponse.json(
      { error: "Tiada kebenaran / Not authorized" },
      { status: 403 },
    );
  }

  const form = await req.formData();
  const filter: AuditFilter = {};
  const year = form.get("year");
  const quarter = form.get("quarter");
  const search = form.get("search");
  if (year) filter.year = Number(year);
  if (quarter) filter.quarter = Number(quarter) as 1 | 2 | 3 | 4;
  if (search) filter.search = String(search);

  const rows = await queryAuditLogs(userId, filter);
  const stamp = new Date().toISOString().slice(0, 10);
  const titleMs = "Jejak Audit";
  const titleEn = "Audit Trail";

  const format = (form.get("format") ?? "xlsx") as "xlsx" | "docx" | "html";

  if (format === "docx") {
    const data = await rowsToWordBuffer(auditColumnHeaders, rows, "ms");
    return file(
      data,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      `audit-${stamp}.docx`,
    );
  }
  if (format === "html") {
    const matrix = toMatrix(auditColumnHeaders, rows, "ms");
    const html = buildReportHtml({ titleMs, titleEn, locale: "ms", matrix });
    return file(Buffer.from(html, "utf-8"), "text/html", `audit-${stamp}.html`);
  }
  const data = await rowsToExcelBuffer(auditColumnHeaders, rows, "ms");
  return file(
    data,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `audit-${stamp}.xlsx`,
  );
}

function file(data: Uint8Array, mime: string, filename: string): NextResponse {
  return new NextResponse(data as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/**
 * Placeholder for the authenticated viewer. The real identity must come from
 * Claude's session (src/lib/auth) — this is a scaffold so the screen compiles
 * and runs before that lane is merged. Do NOT ship this as the auth source.
 */
async function currentUserId(): Promise<bigint> {
  return BigInt(1);
}
