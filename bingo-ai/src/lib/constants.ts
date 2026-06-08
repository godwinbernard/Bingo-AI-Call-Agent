import type {
  Feature,
  PricingTier,
  Testimonial,
  FaqItem,
  HowItWorksStep,
  NavLink,
  LogoBrand,
  ComplianceBadge,
} from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const LOGO_BRANDS: LogoBrand[] = [
  { name: "Redfin" },
  { name: "Paychex" },
  { name: "SoFi" },
  { name: "Brex" },
  { name: "GoFundMe" },
  { name: "Docusign" },
  { name: "Nubank" },
  { name: "ADT" },
];

export const FEATURES: Feature[] = [
  {
    icon: "🎙️",
    title: "Ultra-Realistic Voice",
    description:
      "ElevenLabs-powered voices indistinguishable from human agents. Natural pauses, dynamic tone, emotional inflection.",
    color: "teal",
  },
  {
    icon: "🧠",
    title: "Adaptive AI Brain",
    description:
      "Claude-powered conversation engine that handles objections, follows scripts, and knows when to escalate to a human.",
    color: "purple",
  },
  {
    icon: "⚡",
    title: "Sub-500ms Response",
    description:
      "Streaming STT + parallel TTS pipeline delivers responses faster than any human rep. No awkward silences.",
    color: "red",
  },
  {
    icon: "📊",
    title: "Real-time Dashboard",
    description:
      "Live call monitoring, conversion analytics, A/B script testing, and exportable reports—all in one place.",
    color: "teal",
  },
  {
    icon: "🔌",
    title: "CRM Integrations",
    description:
      "Native sync with HubSpot, Salesforce, and 40+ tools via Zapier. Outcomes logged automatically after every call.",
    color: "purple",
  },
  {
    icon: "🛡️",
    title: "Built-in Compliance",
    description:
      "Automatic DNC checking, TCPA calling-hours enforcement, call recording consent, and full audit trails.",
    color: "red",
  },
];

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    number: "01",
    title: "Upload Your Contacts",
    description:
      "Import a CSV with names, phone numbers, and any custom variables. We validate and dedupe automatically.",
  },
  {
    number: "02",
    title: "Build Your Script",
    description:
      "Use our visual script builder to define your opening, pitch, objection handling, and call-to-action branches.",
  },
  {
    number: "03",
    title: "Launch Campaign",
    description:
      "Set your calling hours, concurrency limits, and retry logic. Hit launch and watch the calls go out in real time.",
  },
  {
    number: "04",
    title: "Review & Optimize",
    description:
      "Get full transcripts, sentiment scores, and conversion analytics. Refine your script and scale what works.",
  },
];

export const COMPLIANCE_BADGES: ComplianceBadge[] = [
  { label: "SOC 2 Type II", icon: "🔒" },
  { label: "HIPAA Ready", icon: "🏥" },
  { label: "GDPR Compliant", icon: "🇪🇺" },
  { label: "TCPA Compliant", icon: "📞" },
  { label: "PCI DSS", icon: "💳" },
  { label: "EU AI Act", icon: "🤖" },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: 99,
    calls: "500 calls/mo",
    features: [
      "1 concurrent call",
      "Basic script builder",
      "CSV import",
      "Email support",
      "Call recordings",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: 299,
    calls: "2,000 calls/mo",
    features: [
      "5 concurrent calls",
      "Advanced script builder",
      "CRM integrations",
      "Priority support",
      "A/B testing",
      "Custom voice",
    ],
    featured: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: 999,
    calls: "Unlimited calls",
    features: [
      "Unlimited concurrency",
      "Custom AI training",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "White-label option",
    ],
    cta: "Contact Sales",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    initials: "JL",
    name: "Jake Liu",
    role: "Head of Sales",
    company: "PropTech Corp",
    text: "We replaced an entire SDR team with Bingo AI. Same pipeline output at 15% of the cost. The voices are so realistic our prospects don't even realize they're talking to an AI until we tell them.",
    color: "#00f5d4",
  },
  {
    initials: "SK",
    name: "Sofia Kowalski",
    role: "VP Operations",
    company: "LendFast",
    text: "The compliance features alone are worth the price. DNC checking, TCPA hours enforcement, and automatic consent recording—it's like having a compliance officer on every call.",
    color: "#7b61ff",
  },
  {
    initials: "MR",
    name: "Marcus Reed",
    role: "Founder",
    company: "GrowthLoop",
    text: "We went from 200 calls/day to 3,000 calls/day overnight. The A/B testing feature helped us find a script variant that doubled our conversion rate in two weeks.",
    color: "#ff6b6b",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How realistic are the AI voices?",
    answer:
      "Our voices are powered by ElevenLabs' latest voice cloning technology, trained on thousands of hours of natural human speech. In blind tests, over 85% of people cannot distinguish our AI voices from real humans. We offer 50+ voice options including different accents, ages, and styles.",
  },
  {
    question: "Is this TCPA compliant?",
    answer:
      "Yes. Bingo AI enforces TCPA calling hours automatically based on the recipient's local timezone (8am–9pm). We check your contact list against the National DNC Registry before every campaign, and all calls include required consent disclosures. We also maintain full audit trails for compliance documentation.",
  },
  {
    question: "What happens when someone wants to speak to a human?",
    answer:
      "Our AI detects escalation intent in real time. When triggered, it can warm-transfer the call to a live agent, schedule a callback, or collect contact info for follow-up—whatever workflow you configure. The transition is seamless and the live agent receives full context from the AI conversation.",
  },
  {
    question: "Can I use my own script?",
    answer:
      "Absolutely. You can import existing scripts in plain text or JSON format, or build from scratch using our visual script builder. The builder supports conditional branches, variable injection (name, company, etc.), objection handling trees, and multi-language support.",
  },
  {
    question: "How does billing work?",
    answer:
      "You're billed monthly based on your plan's call allocation. A 'call' is counted when a human answers (AMD filters out voicemails and answering machines, which don't count). Unused calls don't roll over. Enterprise plans have custom pricing based on volume.",
  },
  {
    question: "What integrations do you support?",
    answer:
      "Native integrations: HubSpot, Salesforce, Pipedrive, Zoho CRM. Via Zapier/Make: 5,000+ apps including Slack, Google Sheets, Airtable, and more. We also offer a full REST API and webhooks for custom integrations.",
  },
];

export const BOT_RESPONSES: Record<string, string> = {
  pricing:
    "We have three plans: Starter at $99/mo (500 calls), Growth at $299/mo (2,000 calls), and Enterprise at $999/mo (unlimited). All plans include a 14-day free trial. Want me to walk you through the differences?",
  "get started":
    "Getting started is easy: 1. Sign up for a free trial — no credit card needed. 2. Upload your contact list (CSV). 3. Build or import your script. 4. Launch your first campaign. The whole setup takes under 10 minutes!",
  integrations:
    "We integrate natively with HubSpot, Salesforce, Pipedrive, and Zoho. Via Zapier and Make, you can connect to 5,000+ apps. We also have a REST API for custom integrations. What CRM are you using?",
  "free trial":
    "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card required to start. You get 100 free calls to test everything out. Ready to sign up?",
  default:
    "Great question! For detailed help, please reach out to our team at hello@bingo.ai or use the live chat below. We're available Mon-Fri 9am-6pm EST and typically respond within a few minutes.",
};

export const BOT_QUICK_ASKS = [
  { emoji: "💰", label: "Pricing", key: "pricing" },
  { emoji: "🚀", label: "Get started", key: "get started" },
  { emoji: "🔌", label: "Integrations", key: "integrations" },
  { emoji: "🎁", label: "Free trial", key: "free trial" },
];
