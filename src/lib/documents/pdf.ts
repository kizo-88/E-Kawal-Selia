/**
 * Document rendering to PDF — GP-13.
 *
 * GP-13 requires documents (licences, permits, supporting letters) to be
 * downloadable as PDF. A PDF is a binary format and producing it needs a
 * renderer (CLAUDE.md / ADR 0001 names Puppeteer). Puppeteer is NOT an approved
 * dependency for this lane — adding one is a lead decision ("ask the lead
 * before adding any package"). So this module does not import a renderer.
 *
 * This is the SINGLE place a renderer would be wired. Until the lead approves a
 * dependency, documents are delivered as print-ready HTML (engine.generateDocument
 * returns it) — exactly what a browser "Print → PDF" or an approved headless
 * renderer would consume. The binary step is flagged to the lead rather than
 * guessed at.
 */

export async function renderDocumentToPdf(
  // Reserved: the HTML the approved renderer will consume. Not referenced until
  // a renderer dependency is wired, hence the documented underscore.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- parameter reserved for the lead-approved PDF renderer
  _html: string,
): Promise<Buffer> {
  throw new Error(
    "PDF renderer not configured. Ask the lead to approve a dependency (e.g. puppeteer) before wiring renderDocumentToPdf.",
  );
}
