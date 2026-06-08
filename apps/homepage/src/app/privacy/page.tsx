import { PageShell } from "@/components/layout/PageShell";

const SECTIONS = [
  {
    title: "1. Information we collect",
    content: `We collect information you provide directly to us, information generated through your use of the platform, and certain information from third parties.

**Information you provide:**
- Account registration: name, email address, company name, phone number, billing information.
- Contact lists: phone numbers, names, and custom fields you upload for calling campaigns.
- Script content: text, variables, and logic you enter into the script builder.
- Support communications: messages you send to our support team.

**Information generated automatically:**
- Call data: call recordings (where permitted and disclosed), transcripts, duration, outcome codes, sentiment scores, and AMD classification for every call placed through the platform.
- Usage data: pages visited, features used, session duration, API requests, and error events.
- Device and connection data: IP address, browser type, operating system, and referring URL.

**Information from third parties:**
- CRM data synchronized via HubSpot, Salesforce, Pipedrive, or Zoho integrations.
- Identity verification data from payment processors (Stripe).`,
  },
  {
    title: "2. How we use your information",
    content: `We use the information we collect to:
- Provide, operate, and improve the Bingo AI platform.
- Process campaigns, place calls, and generate transcripts and analytics on your behalf.
- Process payments and send billing communications.
- Respond to support requests and account inquiries.
- Send product updates, compliance alerts, and feature announcements (you may opt out of marketing emails at any time).
- Detect and prevent fraud, abuse, and security incidents.
- Meet our legal and compliance obligations.

We do not sell your personal data or your contact lists to third parties. We do not use your call recordings or transcripts to train AI models without your explicit consent.`,
  },
  {
    title: "3. How we share your information",
    content: `We share data only as necessary to provide the service:

- **Service providers:** Twilio (telephony), Deepgram (speech-to-text), ElevenLabs (text-to-speech), Anthropic (conversation AI), Stripe (payments), and AWS (infrastructure). Each provider processes only the data necessary for its specific function and is bound by data processing agreements.
- **CRM integrations:** When you connect a CRM, call outcomes and contact updates are pushed to that system on your behalf.
- **Compliance partners:** We check contact phone numbers against the National DNC Registry. This involves transmitting phone numbers to the registry lookup service; no other information is shared.
- **Legal requirements:** We may disclose information when required by law, court order, or valid legal process.
- **Business transfers:** If Bingo AI is acquired or merges with another entity, your data may transfer as part of that transaction. We will notify you before your data becomes subject to a different privacy policy.`,
  },
  {
    title: "4. Data retention",
    content: `We retain different categories of data for different periods:
- Account data: retained for the duration of your subscription plus 90 days after cancellation, then deleted or anonymized.
- Call recordings: Starter plan: 30 days. Growth plan: 90 days. Enterprise plan: configurable, default unlimited.
- Call transcripts and analytics: retained for 24 months, then anonymized.
- Billing records: retained for 7 years to meet financial record-keeping requirements.
- Support communications: retained for 3 years.

You may request earlier deletion of your account data by contacting privacy@bingo.ai. We will process deletion requests within 30 days, except where retention is required by law.`,
  },
  {
    title: "5. Your rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:
- **Access:** Request a copy of the personal data we hold about you.
- **Correction:** Request correction of inaccurate or incomplete data.
- **Deletion:** Request deletion of your personal data (subject to retention obligations).
- **Portability:** Request your data in a machine-readable format.
- **Objection:** Object to certain processing activities, including direct marketing.
- **Restriction:** Request restriction of processing in certain circumstances.

To exercise any of these rights, email privacy@bingo.ai with your request and sufficient information to verify your identity. We respond within 30 days (GDPR) or 45 days (CCPA).

**For California residents:** Under the CCPA, you have the right to know what personal information we collect, the right to delete, and the right to opt out of the sale of personal information. We do not sell personal information.`,
  },
  {
    title: "6. Security",
    content: `We implement technical and organizational measures designed to protect your data:
- Encryption in transit (TLS 1.2+) and at rest (AES-256).
- Role-based access controls limiting internal access to personal data.
- Regular third-party security audits and penetration testing.
- SOC 2 Type II certification (report available on request to Enterprise customers).

No system is perfectly secure. We will notify affected customers promptly in the event of a data breach that poses a significant risk.`,
  },
  {
    title: "7. Contact data and TCPA",
    content: `When you upload a contact list to Bingo AI, you represent and warrant that:
- You have obtained all required consents to contact those individuals by telephone.
- The contact list does not include numbers on the National DNC Registry (we perform an additional automated check, but this does not substitute for your obligation).
- You will use the platform only to place calls permitted by applicable law.

See our TCPA Compliance page for detailed guidance on consent requirements and calling-hour restrictions.`,
  },
  {
    title: "8. International data transfers",
    content: `Bingo AI is based in the United States. If you use our platform from the European Economic Area, United Kingdom, or other regions with data transfer restrictions, your data may be transferred to and processed in the US.

We rely on Standard Contractual Clauses (SCCs) approved by the European Commission for transfers of personal data from the EEA to the US. Our Data Processing Agreement (DPA) is available upon request and incorporates these SCCs.

EU data residency (data stored and processed within the EU) is available for Enterprise customers. Contact sales@bingo.ai for details.`,
  },
  {
    title: "9. Changes to this policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of material changes by email (at the address associated with your account) at least 14 days before the changes take effect. Continued use of the platform after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact",
    content: `For privacy-related questions, data subject requests, or to reach our Data Protection Officer:

**Email:** privacy@bingo.ai
**Mail:** Bingo AI, Inc., Attn: Privacy, [Address on file]

We respond to all privacy inquiries within 5 business days.`,
  },
];

export const metadata = {
  title: "Privacy Policy — Bingo AI Call Agent",
  description: "How Bingo AI collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      label="Legal"
      title="Privacy Policy"
      subtitle="This policy describes how Bingo AI, Inc. collects, uses, and protects information about you and your contacts when you use the Bingo AI platform."
      lastUpdated="June 1, 2026"
    >
      <div className="flex flex-col gap-10">
        {SECTIONS.map(({ title, content }) => (
          <div key={title}>
            <h2 className="text-[15.5px] font-bold font-head mb-4" style={{ color: "#E2E8F0" }}>
              {title}
            </h2>
            <div className="flex flex-col gap-3">
              {content.split("\n\n").map((para, i) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
