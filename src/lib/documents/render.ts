/**
 * Document rendering — pure.
 *
 * A DocumentTemplate stores admin-editable HTML split into header / body /
 * footer, plus an optional disclaimer. Rendering is a pure string operation:
 * interpolate `{{variables}}` into each part and wrap in print-ready HTML that
 * carries the paper size and orientation. The exact HTML is therefore testable
 * without a database or a renderer.
 *
 * G4: the disclaimer exists in both languages; the chosen locale picks which.
 */

export type DocumentLocale = "ms" | "en";

export interface DocumentTemplateParts {
  headerHtml: string | null;
  bodyHtml: string;
  footerHtml: string | null;
  disclaimerMs?: string | null;
  disclaimerEn?: string | null;
}

export interface AssembleOptions {
  paperSize?: string;
  orientation?: string;
  locale?: DocumentLocale;
}

const VAR = /\{\{\s*(\w+)\s*\}\}/g;

export function interpolateHtml(html: string, vars: Record<string, string | undefined>): string {
  return html.replace(VAR, (_, key: string) => vars[key] ?? "");
}

export function assembleDocument(
  parts: DocumentTemplateParts,
  vars: Record<string, string | undefined>,
  opts: AssembleOptions = {},
): string {
  const header = parts.headerHtml ? interpolateHtml(parts.headerHtml, vars) : "";
  const body = interpolateHtml(parts.bodyHtml, vars);
  const footer = parts.footerHtml ? interpolateHtml(parts.footerHtml, vars) : "";

  const disclaimer =
    opts.locale === "en" ? parts.disclaimerEn : parts.disclaimerMs;
  const disc = disclaimer
    ? `<p class="disclaimer">${interpolateHtml(disclaimer, vars)}</p>`
    : "";

  const paper = opts.paperSize ?? "A4";
  const orient = opts.orientation ?? "portrait";

  return `<!DOCTYPE html>
<html lang="${opts.locale ?? "ms"}">
<head><meta charset="utf-8"><style>@page { size: ${paper} ${orient}; }</style></head>
<body>
<header>${header}</header>
<main>${body}</main>
${disc}
<footer>${footer}</footer>
</body>
</html>`;
}
