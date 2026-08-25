/**
 * Template rendering for the notification bus — pure.
 *
 * A template carries `bodyMs` / `bodyEn` (and optional `subjectMs` / `subjectEn`)
 * plus a set of `{{variable}}` placeholders. Rendering is a pure string
 * operation so the exact output — and therefore what the applicant receives —
 * is testable without a database or a mailer. G4: both languages always exist;
 * the chosen locale decides which is sent.
 */

export type NotificationLocale = "ms" | "en";

export interface RenderInput {
  subjectMs?: string | null;
  subjectEn?: string | null;
  bodyMs: string;
  bodyEn: string;
  locale: NotificationLocale;
  vars: Record<string, string | undefined>;
}

export interface RenderedNotification {
  title: string;
  body: string;
}

const VAR = /\{\{\s*(\w+)\s*\}\}/g;

export function interpolate(template: string, vars: Record<string, string | undefined>): string {
  return template.replace(VAR, (_, key: string) => vars[key] ?? "");
}

export function renderNotification(input: RenderInput): RenderedNotification {
  const subject =
    input.locale === "en"
      ? input.subjectEn ?? input.subjectMs ?? ""
      : input.subjectMs ?? input.subjectEn ?? "";
  const body = input.locale === "en" ? input.bodyEn : input.bodyMs;
  return {
    title: interpolate(subject, input.vars),
    body: interpolate(body, input.vars),
  };
}
