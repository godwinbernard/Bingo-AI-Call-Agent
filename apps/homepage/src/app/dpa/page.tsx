import { PageShell } from "@/components/layout/PageShell";

const SECTIONS = [
  {
    title: "1. Scope and purpose",
    content: `This Data Processing Agreement ("DPA") forms part of the Terms of Service between Bingo AI, Inc. ("Processor") and the customer ("Controller") and governs the processing of personal data by Bingo AI on behalf of the customer in connection with the Bingo AI platform.

This DPA is entered into to ensure that personal data is processed in compliance with applicable data protection law, including the General Data Protection Regulation (GDPR) (EU) 2016/679, the UK GDPR, the California Consumer Privacy Act (CCPA), and other applicable privacy regulations.

In the event of any conflict between this DPA and the Terms of Service, this DPA shall prevail with respect to personal data processing.`,
  },
  {
    title: "2. Definitions",
    content: `**"Personal Data"** means any information relating to an identified or identifiable natural person, including names, telephone numbers, call recordings, transcripts, and call metadata processed through the platform.

**"Processing"** means any operation performed on personal data, including collection, recording, storage, use, transmission, and deletion.

**"Controller"** means the customer who determines the purposes and means of processing personal data (i.e., the business uploading contact lists and running campaigns).

**"Processor"** means Bingo AI, Inc., which processes personal data on behalf of the Controller.

**"Sub-processor"** means any third party engaged by Bingo AI to process personal data in connection with the Service.

**"Data Subject"** means the natural person whose personal data is being processed (i.e., the individuals in your contact lists who receive calls).`,
  },
  {
    title: "3. Processing instructions",
    content: `Bingo AI will process personal data only on documented instructions from the Controller, unless required to do so by applicable law. The Controller's instructions are set out in the Terms of Service and this DPA, and include:

- Storing contact records (name, phone number, custom fields) uploaded by the Controller.
- Placing outbound telephone calls to contacts in the Controller's campaigns.
- Recording, transcribing, and analyzing calls for the Controller's analytics and quality review.
- Transmitting call outcomes and contact data to the Controller's connected CRM systems on the Controller's instruction.
- Deleting personal data in accordance with the retention periods set out in the Privacy Policy or upon the Controller's written instruction.

Bingo AI will immediately inform the Controller if, in its opinion, an instruction infringes applicable data protection law.`,
  },
  {
    title: "4. Sub-processors",
    content: `The Controller hereby provides general written authorization for Bingo AI to engage sub-processors. Bingo AI's current sub-processors for personal data processing are:

| Sub-processor | Purpose | Location |
|---|---|---|
| Twilio Inc. | Telephony infrastructure | USA |
| Deepgram | Speech-to-text transcription | USA |
| ElevenLabs | Text-to-speech voice synthesis | USA |
| Anthropic PBC | AI conversation processing | USA |
| Amazon Web Services | Cloud infrastructure & storage | USA (+ EU for EU residency option) |
| Stripe Inc. | Payment processing (billing data only) | USA |

Bingo AI will notify the Controller of any intended changes to sub-processors at least 30 days in advance by email. The Controller may object to a new sub-processor within 14 days of notification. If the parties cannot resolve the objection, the Controller may terminate the affected services.

All sub-processors are bound by data processing agreements at least as restrictive as this DPA.`,
  },
  {
    title: "5. Technical and organizational security measures",
    content: `Bingo AI implements the following technical and organizational measures to protect personal data:

**Access controls:**
- Role-based access controls limiting employee access to personal data on a need-to-know basis.
- Multi-factor authentication required for all internal systems.
- Regular access reviews and prompt revocation upon employee departure.

**Encryption:**
- All personal data encrypted in transit using TLS 1.2 or higher.
- All personal data encrypted at rest using AES-256.

**Infrastructure security:**
- SOC 2 Type II certified infrastructure.
- Regular third-party penetration testing (results available to Enterprise customers under NDA).
- Vulnerability management program with defined SLAs for remediation.

**Operational security:**
- Security awareness training for all employees with access to personal data.
- Incident response plan with defined escalation procedures.
- Business continuity plan with regular backup and recovery testing.`,
  },
  {
    title: "6. Data subject rights",
    content: `Bingo AI will provide reasonable technical assistance to the Controller to respond to data subject rights requests, including requests for access, correction, deletion, portability, and objection.

When a data subject contacts Bingo AI directly with a rights request relating to data the Controller has uploaded, Bingo AI will promptly forward the request to the Controller. The Controller is responsible for responding to data subject requests within applicable timeframes (30 days under GDPR; 45 days under CCPA).

For data deletion requests, the Controller may use the dashboard to delete individual contact records or complete campaign data, or may submit a written deletion request to privacy@bingo.ai.`,
  },
  {
    title: "7. International data transfers",
    content: `Bingo AI is headquartered in the United States. Processing of personal data from the European Economic Area (EEA) or United Kingdom may involve transfer to the US or other countries.

Bingo AI relies on Standard Contractual Clauses (SCCs) as approved by the European Commission under GDPR Article 46(2)(c) for transfers from the EEA to the US. Module 2 (Controller to Processor) SCCs are incorporated into this DPA by reference.

For UK-based customers, the UK Addendum to the SCCs applies.

**EU data residency:** Enterprise customers may request that all personal data be stored and processed exclusively within the EU (Ireland region). Contact sales@bingo.ai for pricing and configuration details.

A copy of the applicable SCCs is available upon request at privacy@bingo.ai.`,
  },
  {
    title: "8. Data breach notification",
    content: `In the event of a personal data breach affecting personal data processed under this DPA, Bingo AI will:

- Notify the Controller without undue delay and in any event within 72 hours of becoming aware of the breach.
- Provide initial notification including: the nature of the breach, categories and approximate number of data subjects and records affected, likely consequences, and measures taken or proposed.
- Provide further information as it becomes available.

The Controller is responsible for notifying relevant supervisory authorities and data subjects as required by applicable law.`,
  },
  {
    title: "9. Audit rights",
    content: `The Controller may audit Bingo AI's compliance with this DPA no more than once per year, upon 30 days' written notice. Audits shall be conducted during business hours, shall not disrupt normal operations, and shall be subject to confidentiality obligations.

In lieu of on-site audits, Bingo AI will make available its SOC 2 Type II report and relevant third-party audit reports upon request (Enterprise customers only, under NDA). Bingo AI may charge a reasonable fee for on-site audits.`,
  },
  {
    title: "10. Term and termination",
    content: `This DPA remains in effect for the duration of the Terms of Service. Upon termination of the Terms of Service, Bingo AI will, at the Controller's choice, delete or return all personal data processed under this DPA within 90 days of termination, unless applicable law requires retention.

Bingo AI will provide written certification of data deletion upon request.`,
  },
  {
    title: "11. Contact and execution",
    content: `This DPA is deemed executed upon acceptance of the Terms of Service. No separate signature is required for standard plans.

Enterprise customers who require a countersigned DPA for their legal records may request one by emailing legal@bingo.ai. A signed copy will be returned within 5 business days.

For data protection inquiries: privacy@bingo.ai
Data Protection Officer: dpo@bingo.ai`,
  },
];

export const metadata = {
  title: "Data Processing Agreement — Bingo AI Call Agent",
  description: "Bingo AI's Data Processing Agreement covering GDPR, CCPA, and cross-border data transfer compliance.",
};

export default function DpaPage() {
  return (
    <PageShell
      label="Legal"
      title="Data Processing Agreement"
      subtitle="This DPA governs how Bingo AI processes personal data on behalf of our customers in compliance with GDPR, UK GDPR, CCPA, and applicable data protection law."
      lastUpdated="June 1, 2026"
    >
      <div className="flex flex-col gap-10">
        {SECTIONS.map(({ title, content }) => (
          <div key={title}>
            <h2 className="text-[15.5px] font-bold font-head mb-4" style={{ color: "#E2E8F0" }}>
              {title}
            </h2>
            <div className="flex flex-col gap-3">
              {content.split("\n\n").map((para, i) => {
                if (para.startsWith("|")) {
                  const rows = para.split("\n").filter((r) => !r.match(/^\|[-|\s]+$/));
                  const headers = rows[0].split("|").filter(Boolean).map((h) => h.trim());
                  const dataRows = rows.slice(1).map((r) => r.split("|").filter(Boolean).map((c) => c.trim()));
                  return (
                    <div key={i} className="overflow-x-auto">
                      <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {headers.map((h) => (
                              <th
                                key={h}
                                className="text-left px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wider"
                                style={{
                                  color: "rgba(226,232,240,0.45)",
                                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataRows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className="px-4 py-3"
                                  style={{
                                    color: "rgba(226,232,240,0.58)",
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                  }}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return (
                  <p
                    key={i}
                    className="text-[13.5px] leading-[1.8]"
                    style={{ color: "rgba(226,232,240,0.55)" }}
                    dangerouslySetInnerHTML={{
                      __html: para
                        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E2E8F0">$1</strong>')
                        .replace(/^- /gm, "• "),
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
