export interface Feature {
  icon: string;
  title: string;
  description: string;
  color: "teal" | "purple" | "red";
}

export interface PricingTier {
  name: string;
  price: number;
  calls: string;
  features: string[];
  featured?: boolean;
  cta: string;
}

export interface Testimonial {
  initials: string;
  name: string;
  role: string;
  company: string;
  text: string;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export interface BotMessage {
  role: "user" | "bot";
  content: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface LogoBrand {
  name: string;
}

export interface ComplianceBadge {
  label: string;
  icon: string;
}
