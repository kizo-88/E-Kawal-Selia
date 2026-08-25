/**
 * Email transport — THE ONLY place in the codebase permitted to import a mailer.
 *
 * The `kawalselia/no-direct-mail` lint rule exists so that every outbound email
 * funnels through the notification bus (which records preferences, renders the
 * template and writes the audit row). Callers must call `sendEmail` here; they
 * must never import a mailer themselves.
 *
 * No mailer dependency is bundled yet. To keep this compiling without adding a
 * package (which is a lead decision per ADR 0001), the transport is injected.
 * A real deployment wires a transport via `setEmailTransport` — that is where a
 * `nodemailer` / Supabase Auth mailer import would live, and nowhere else.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface EmailTransport {
  send(msg: EmailMessage): Promise<void>;
}

let activeTransport: EmailTransport | null = null;

export function setEmailTransport(transport: EmailTransport | null): void {
  activeTransport = transport;
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  if (!activeTransport) {
    // No transport configured (dev / not yet wired). Fail soft so screens and
    // fixtures keep working; a real deployment sets a transport at boot.
    return;
  }
  await activeTransport.send(msg);
}
