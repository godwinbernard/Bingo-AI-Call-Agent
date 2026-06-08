import { PageShell } from "@/components/layout/PageShell";

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    content: `By creating an account, accessing, or using the Bingo AI platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of a company or other legal entity, you represent that you have authority to bind that entity to these Terms, and "you" refers to that entity.

If you do not agree to these Terms, do not use the Service. These Terms were last updated on June 1, 2026.`,
  },
  {
    title: "2. Description of service",
    content: `Bingo AI provides an AI-powered outbound calling platform that enables businesses to deploy automated voice agents for sales, lead qualification, appointment booking, and related outbound communication workflows. The Service includes the web dashboard, REST API, script builder, campaign management tools, analytics, integrations, and related documentation.`,
  },
  {
    title: "3. Eligibility and accounts",
    content: `You must be at least 18 years old and capable of forming a binding contract to use the Service. You must provide accurate account information and keep it current.

You are responsible for maintaining the security of your account credentials. You are responsible for all activity that occurs under your account. Notify us immediately at security@bingo.ai if you suspect unauthorized access.

You may not share your account credentials with any person outside your organization or use the Service on behalf of a competitor of Bingo AI without prior written consent.`,
  },
  {
    title: "4. Acceptable use",
    content: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:

- Use the Service to place calls to individuals who have not provided legally required consent.
- Use the Service to contact numbers on the National Do Not Call Registry without a valid exemption.
- Place calls outside permitted calling hours (8am–9pm in the recipient's local timezone) except where your specific exemption applies.
- Misrepresent the nature, identity, or purpose of your calls in a way that violates applicable law.
- Use the Service to transmit unsolicited commercial messages in violation of the CAN-SPAM Act, CASL, or similar laws.
- Use the Service to harass, threaten, or abuse call recipients.
- Attempt to circumvent, disable, or interfere with security features of the Service.
- Use automated means to access or scrape the Service beyond normal API usage.
- Resell, sublicense, or white-label the Service without a written agreement with Bingo AI.

We reserve the right to suspend or terminate any account that we reasonably believe is in violation of these restrictions.`,
  },
  {
    title: "5. Compliance obligations",
    content: `You are solely responsible for ensuring that your use of the Service complies with all applicable laws and regulations, including without limitation:

- The Telephone Consumer Protection Act (TCPA) and its implementing regulations.
- The Telemarketing Sales Rule (TSR) and FTC guidelines.
- The Do-Not-Call Implementation Act.
- State-specific telemarketing and robocall laws.
- The General Data Protection Regulation (GDPR) if you are contacting individuals in the EU.
- Any sector-specific regulations applicable to your industry (HIPAA, GLBA, etc.).

Bingo AI provides compliance tools (DNC checking, calling-hour enforcement, consent recording) as a convenience. Use of these tools does not guarantee legal compliance and does not substitute for your own legal review and obligations. We are not your legal counsel. Consult qualified legal counsel before running calling campaigns.`,
  },
  {
    title: "6. Contact data and privacy",
    content: `You represent and warrant that:
- You have obtained all legally required consents to contact each individual on any contact list you upload to the Service.
- Your contact lists do not include any numbers for which you lack required consent, including numbers on Do Not Call lists.
- You have the right to provide contact data to Bingo AI for processing on your behalf.

You retain all ownership of your contact data. Bingo AI processes contact data only on your instructions and as described in our Privacy Policy and Data Processing Agreement. You are the data controller; Bingo AI is a data processor.`,
  },
  {
    title: "7. Intellectual property",
    content: `Bingo AI retains all rights, title, and interest in the Service, including all software, technology, documentation, and associated intellectual property. Nothing in these Terms grants you any rights to the Bingo AI name, logo, or brand.

You retain ownership of content you create within the Service (scripts, recordings, contact data). You grant Bingo AI a limited license to process that content to provide the Service.

You may not copy, modify, distribute, sell, or lease any part of the Service, or reverse-engineer or attempt to extract the source code of the Service.`,
  },
  {
    title: "8. Payment and billing",
    content: `Fees are billed monthly in advance based on your selected plan. A call is counted when a live human answers (AMD classification). Voicemails, busy signals, and unanswered calls are not counted.

All fees are non-refundable except as required by law or as expressly stated in these Terms. If you upgrade your plan, the additional charges are prorated and billed immediately. If you downgrade, the change takes effect at the start of your next billing cycle.

Failure to pay may result in suspension of your account. If your account is suspended for non-payment for more than 30 days, we may terminate your account and delete your data.`,
  },
  {
    title: "9. Disclaimers",
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. BINGO AI DISCLAIMS ALL WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

We do not warrant that the Service will be uninterrupted, error-free, or completely secure. We do not warrant that use of the Service will result in any particular business outcome, conversion rate, or revenue.`,
  },
  {
    title: "10. Limitation of liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, BINGO AI'S TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE IS LIMITED TO THE FEES YOU PAID TO BINGO AI IN THE 12 MONTHS PRECEDING THE CLAIM.

BINGO AI IS NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

YOU ACKNOWLEDGE THAT BINGO AI IS NOT LIABLE FOR ANY FINES, PENALTIES, OR DAMAGES ARISING FROM YOUR VIOLATION OF THE TCPA, TSR, OR ANY OTHER LAW APPLICABLE TO YOUR CALLING CAMPAIGNS.`,
  },
  {
    title: "11. Indemnification",
    content: `You agree to indemnify, defend, and hold harmless Bingo AI and its officers, directors, employees, and agents from any claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any law or regulation in connection with calling campaigns; or (d) your contact data or calling content.`,
  },
  {
    title: "12. Termination",
    content: `Either party may terminate the Service at any time. You may cancel your subscription through the dashboard or by contacting hello@bingo.ai. Bingo AI may terminate or suspend your account immediately if you breach these Terms.

Upon termination, your right to access the Service ends immediately. We will retain your data for 90 days after termination to allow data export, then delete it in accordance with our Privacy Policy.`,
  },
  {
    title: "13. Governing law and disputes",
    content: `These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. Any dispute arising from these Terms will be resolved by binding arbitration under the AAA Commercial Arbitration Rules in Delaware, except that either party may seek injunctive relief in a court of competent jurisdiction.

You waive any right to a class action lawsuit or class-wide arbitration.`,
  },
  {
    title: "14. Changes to terms",
    content: `We may update these Terms. We will notify you by email at least 14 days before material changes take effect. Continued use of the Service after the effective date constitutes acceptance.

For questions about these Terms, contact legal@bingo.ai.`,
  },
];

export const metadata = {
  title: "Terms of Service — Bingo AI Call Agent",
  description: "Terms and conditions for using the Bingo AI outbound calling platform.",
};

export default function TermsPage() {
  return (
    <PageShell
      label="Legal"
      title="Terms of Service"
      subtitle="Please read these terms carefully before using the Bingo AI platform. By using the Service, you agree to be bound by these Terms."
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
                      .replace(/^- /gm, "• ")
                      .replace(/\(a\)/g, "(a)")
                      .replace(/\(b\)/g, "(b)")
                      .replace(/\(c\)/g, "(c)")
                      .replace(/\(d\)/g, "(d)"),
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
