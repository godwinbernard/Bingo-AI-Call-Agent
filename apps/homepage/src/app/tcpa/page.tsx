import { PageShell } from "@/components/layout/PageShell";
import { ShieldCheck, Clock, Phone, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

const SECTIONS = [
  {
    Icon: ShieldCheck,
    title: "What is the TCPA?",
    content: `The Telephone Consumer Protection Act (TCPA), 47 U.S.C. § 227, is a federal law that restricts telemarketing calls, auto-dialed calls, prerecorded messages, text messages, and unsolicited faxes. It is enforced by the FCC and creates a private right of action — meaning individuals can sue violators directly for $500–$1,500 per violation.

For AI-powered outbound calling, the TCPA is the most important piece of compliance law you need to understand. The penalties are significant ($500 per call for negligent violations; $1,500 per call for willful violations), and class action exposure can reach into the millions.

Bingo AI is designed with TCPA compliance built into the platform's core. This guide explains what the law requires, how our platform helps you comply, and what you are still responsible for as the calling party.`,
    accent: "#4F8EF7",
  },
  {
    Icon: FileText,
    title: "Consent requirements",
    content: `The TCPA's consent requirements depend on the type of call you're placing:

**Informational calls (non-sales, non-marketing):**
Calls that are purely informational — appointment reminders, fraud alerts, delivery notifications — generally require only express consent, which can be as simple as providing a phone number for that purpose.

**Telemarketing calls to cell phones using an ATDS or prerecorded voice:**
This is where most AI calling platforms operate. The FCC's 2024 one-to-one consent ruling requires that consent be:
• Clear and conspicuous disclosure that the consumer is authorizing calls by an AI or automated system.
• Written (text message opt-in, web form checkbox, or signed document).
• Specific to your company — not bundled with consent for a third party or a "lead generator."

**What does NOT constitute valid consent:**
• Purchasing a list of phone numbers from a data broker does not come with TCPA consent.
• A previous business relationship (buying from your company, being a customer) is not sufficient for AI-automated calling to a cell phone.
• Opt-in consent for email does not transfer to telephone calls.

**What we require:** Before running any campaign through Bingo AI, you must attest that you have obtained legally required consent for each contact on your list. Providing false attestation is a breach of our Terms of Service.`,
    accent: "#8B5CF6",
  },
  {
    Icon: Clock,
    title: "Calling hours",
    content: `The TCPA restricts telemarketing calls to the hours of 8:00 AM to 9:00 PM in the called party's local timezone. "Local timezone" means the timezone where the recipient's phone is registered — not your office's timezone.

**How Bingo AI enforces this:**
Our platform automatically determines the local timezone for each phone number using the area code and exchange, then checks whether the current time falls within the permitted calling window before placing any call. Calls are held in queue until the window opens if a campaign is launched outside of hours.

**Important nuances:**
• Some states have stricter calling-hour restrictions than federal law. Our compliance engine applies the most restrictive applicable rule.
• Sunday restrictions: Some state laws further restrict Sunday calling or reduce the permitted window.
• Holidays: Federal law does not restrict calling on holidays, but many enterprise customers choose to exclude them. You can configure campaign blackout dates in the dashboard.

**What you should do:**
Review state-specific restrictions for the states where your contacts are located. If you're calling across many states, consult with telemarketing compliance counsel to ensure your campaign settings meet all applicable requirements.`,
    accent: "#F59E0B",
  },
  {
    Icon: Phone,
    title: "Do Not Call (DNC) Registry",
    content: `The National Do Not Call Registry is maintained by the FTC. Calling a number on the DNC Registry for telemarketing purposes can result in fines of up to $51,744 per call (FTC and FCC combined).

**How Bingo AI handles DNC:**
Every contact list you upload is automatically scrubbed against the National DNC Registry before your campaign goes live. Numbers that match registry entries are flagged and excluded from calling. The check runs at campaign launch and again at the start of each calling day for multi-day campaigns.

**What this does NOT cover:**
• Your internal DNC list: You are required to maintain an internal DNC list of consumers who have asked not to be called by your company specifically. Bingo AI supports uploading your internal suppression list, but populating and maintaining it is your responsibility.
• State DNC registries: Some states maintain their own DNC registries (Texas, Indiana, Wyoming, etc.) with separate registration requirements. Our platform checks only the federal registry. Check state registry compliance separately.
• B2B calling: The National DNC Registry applies to residential consumers. Business-to-business calls have different rules. Review FTC guidance for B2B telemarketing compliance.`,
    accent: "#10B981",
  },
  {
    Icon: FileText,
    title: "Disclosures and identification",
    content: `Federal law and FCC rules require that automated calls include specific disclosures:

**For prerecorded messages and AI-generated voice calls:**
• The call must identify the business on whose behalf the call is made.
• The call must provide a callback number or automated opt-out mechanism within the first 60 seconds of the message.
• Calls must disclose at the beginning that the message is pre-recorded or AI-generated (FCC AI voice disclosure rule, effective 2025).

**How Bingo AI handles this:**
Our script builder includes a required disclosure field at the top of every call script. The platform enforces that a company name and callback number are included in your script before a campaign can be activated. You are responsible for ensuring the content of your disclosures is accurate.

**Opt-out handling:**
Any consumer who says "stop calling," "remove me," "take me off your list," or similar during a Bingo AI call will be flagged immediately. The call ends, and the number is added to your internal suppression list. You can review and export your suppression list from the dashboard at any time.`,
    accent: "#4F8EF7",
  },
  {
    Icon: AlertTriangle,
    title: "Your responsibilities",
    content: `Bingo AI provides compliance infrastructure to support your legal obligations. However, you remain solely responsible for:

**Before running campaigns:**
• Obtaining valid written consent for each contact you intend to call with an automated system.
• Ensuring your contact lists do not include numbers from consumers who have previously asked not to be called by your company.
• Registering your Caller ID number with STIR/SHAKEN authentication to reduce the likelihood of calls being flagged as spam.
• Verifying that your calling content (script) meets disclosure requirements.

**During campaigns:**
• Monitoring campaign performance and pausing campaigns if you receive compliance complaints.
• Ensuring your team can handle call transfers and opt-out requests within required timeframes.
• Keeping records of consent and call logs.

**After campaigns:**
• Honoring opt-out requests within 30 days (best practice: immediately).
• Maintaining call records and consent documentation for at least 4 years (FCC record-keeping requirement).`,
    accent: "#F59E0B",
  },
  {
    Icon: CheckCircle2,
    title: "What Bingo AI does automatically",
    content: `The following compliance measures are built into the platform and run on every campaign without any configuration required:

✓ National DNC Registry check before campaign launch
✓ Calling-hours enforcement by recipient local timezone
✓ Required disclosure field in script builder
✓ Opt-out detection and automatic suppression
✓ Call recording with required consent disclosure
✓ Full call log and audit trail generation
✓ AMD (Answering Machine Detection) to separate live calls from machines
✓ STIR/SHAKEN-compliant Twilio calling infrastructure

These features reduce your compliance risk significantly. They do not eliminate it. You must still obtain valid consent, maintain your internal DNC list, and consult legal counsel for your specific use case.`,
    accent: "#10B981",
  },
];

export const metadata = {
  title: "TCPA Compliance — Bingo AI Call Agent",
  description: "How Bingo AI helps you run TCPA-compliant AI calling campaigns, and what your responsibilities are as the calling party.",
};

export default function TcpaPage() {
  return (
    <PageShell
      label="Compliance"
      title="TCPA compliance guide"
      subtitle="How Bingo AI helps you comply with the Telephone Consumer Protection Act — and what you remain responsible for as the party placing the calls."
      lastUpdated="June 1, 2026"
    >
      <div
        className="flex items-start gap-3 p-5 rounded-xl mb-12"
        style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <AlertTriangle size={16} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
        <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.6)" }}>
          <strong style={{ color: "#E2E8F0" }}>This is not legal advice.</strong> This guide explains how our platform works and provides general information about TCPA compliance. Telemarketing law is complex and fact-specific. Consult qualified legal counsel before running calling campaigns, especially if you are in a regulated industry or calling at high volume.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {SECTIONS.map(({ Icon, title, content, accent }) => (
          <div key={title}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}12`, border: `1px solid ${accent}28` }}
              >
                <Icon size={16} style={{ color: accent }} strokeWidth={1.75} />
              </div>
              <h2 className="text-[16px] font-bold font-head" style={{ color: "#E2E8F0" }}>
                {title}
              </h2>
            </div>
            <div className="flex flex-col gap-3 pl-12">
              {content.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="text-[13.5px] leading-[1.8]"
                  style={{ color: "rgba(226,232,240,0.55)" }}
                  dangerouslySetInnerHTML={{
                    __html: para
                      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E2E8F0">$1</strong>')
                      .replace(/^• /gm, "• ")
                      .replace(/^✓ /gm, '<span style="color:#10B981">✓</span> '),
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 p-7 rounded-2xl" style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.18)" }}>
        <h3 className="text-[15px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
          Need compliance support?
        </h3>
        <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.5)" }}>
          Our compliance team can answer questions about how our platform handles specific scenarios. For legal advice, we recommend engaging a telemarketing compliance attorney. Email{" "}
          <a href="mailto:compliance@bingo.ai" style={{ color: "#4F8EF7" }}>compliance@bingo.ai</a>{" "}
          with your question.
        </p>
      </div>
    </PageShell>
  );
}
