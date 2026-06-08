import { PageShell } from "@/components/layout/PageShell";
import { ArrowRight } from "lucide-react";

const POSTS = [
  {
    slug: "#",
    date: "June 2, 2026",
    category: "Best Practices",
    title: "The 5-minute outbound script audit: what kills your connect rate",
    excerpt:
      "Most outbound scripts fail in the first 8 seconds. Here's a diagnostic framework we use with new customers — and how fixing it lifted average connect rates by 31% across our top campaigns.",
    readTime: "7 min read",
    color: "#4F8EF7",
  },
  {
    slug: "#",
    date: "May 22, 2026",
    category: "Compliance",
    title: "TCPA 2026: what changed, what didn't, and what it means for AI calling",
    excerpt:
      "The FCC's 2024 ruling on AI-generated voices and the updated one-to-one consent requirement took effect this year. Here's exactly what you need to know to keep your campaigns compliant.",
    readTime: "9 min read",
    color: "#10B981",
  },
  {
    slug: "#",
    date: "May 8, 2026",
    category: "Product",
    title: "How voice cloning works — and what to think about before you use it",
    excerpt:
      "Cloning a voice is technically straightforward. Using it responsibly takes more thought. We walk through the technical process, the legal landscape, and the ethical considerations we built into our platform.",
    readTime: "11 min read",
    color: "#8B5CF6",
  },
  {
    slug: "#",
    date: "April 28, 2026",
    category: "Case Study",
    title: "How LendFast replaced 4 SDRs with one Bingo AI campaign",
    excerpt:
      "LendFast VP Operations Sofia Kowalski on how they cut outbound cost per qualified call by 78% in 60 days — without sacrificing conversion rate or compliance.",
    readTime: "5 min read",
    color: "#F59E0B",
  },
  {
    slug: "#",
    date: "April 14, 2026",
    category: "Best Practices",
    title: "Answering machine detection: the complete guide for AI call campaigns",
    excerpt:
      "AMD is often treated as a commodity feature. It isn't. False positives waste budget; false negatives violate compliance rules. Here's how our detection model works and how to tune it for your contact list.",
    readTime: "6 min read",
    color: "#4F8EF7",
  },
  {
    slug: "#",
    date: "March 31, 2026",
    category: "Research",
    title: "We analyzed 1 million AI sales calls. Here's what actually converts.",
    excerpt:
      "We crunched anonymized data from our platform to find the patterns behind top-performing campaigns: timing, script length, opener phrasing, objection handling strategies, and more.",
    readTime: "14 min read",
    color: "#8B5CF6",
  },
  {
    slug: "#",
    date: "March 17, 2026",
    category: "Product",
    title: "Introducing the Bingo AI script optimizer",
    excerpt:
      "Our new AI script optimizer analyzes your conversion data and suggests specific phrasing changes — down to individual sentences. Here's how it works and how early customers have used it.",
    readTime: "4 min read",
    color: "#4F8EF7",
  },
  {
    slug: "#",
    date: "March 3, 2026",
    category: "Company",
    title: "Bingo AI 2.0: everything that changed",
    excerpt:
      "We rebuilt the conversation engine, redesigned the dashboard, and launched voice cloning. Here's the full story behind what we shipped — and why it took the approach it did.",
    readTime: "8 min read",
    color: "#8B5CF6",
  },
];

export const metadata = {
  title: "Blog — Bingo AI Call Agent",
  description: "Insights on AI outbound calling, TCPA compliance, sales strategy, and product updates from the Bingo AI team.",
};

export default function BlogPage() {
  return (
    <PageShell
      label="Blog"
      title="Insights from the team"
      subtitle="Deep dives on AI calling, compliance, sales strategy, and product. Written by the people who built Bingo and the customers who use it."
    >
      <div className="flex flex-col gap-0">
        {POSTS.map((post, i) => (
          <a
            key={post.title}
            href={post.slug}
            className="group flex flex-col sm:flex-row gap-5 py-8 transition-opacity duration-200"
            style={{
              borderBottom: i < POSTS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <div className="sm:w-32 flex-shrink-0">
              <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.32)" }}>
                {post.date}
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-wider"
                  style={{ color: post.color }}
                >
                  {post.category}
                </span>
                <span className="text-[11px]" style={{ color: "rgba(226,232,240,0.25)" }}>·</span>
                <span className="text-[12px]" style={{ color: "rgba(226,232,240,0.32)" }}>
                  {post.readTime}
                </span>
              </div>
              <h2
                className="text-[15px] font-semibold font-head mb-2 leading-snug group-hover:text-[#4F8EF7] transition-colors duration-200"
                style={{ color: "#E2E8F0" }}
              >
                {post.title}
              </h2>
              <p className="text-[13.5px] leading-[1.7]" style={{ color: "rgba(226,232,240,0.48)" }}>
                {post.excerpt}
              </p>
              <div
                className="flex items-center gap-1 mt-4 text-[12.5px] font-medium group-hover:gap-2 transition-all duration-200"
                style={{ color: "#4F8EF7" }}
              >
                Read more <ArrowRight size={12} />
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-10 p-7 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.5)" }}>
          <strong style={{ color: "#E2E8F0" }}>Subscribe to the newsletter.</strong>{" "}
          New posts, compliance updates, and product news — once or twice a month, no spam. Email{" "}
          <a href="mailto:newsletter@bingo.ai" style={{ color: "#4F8EF7" }}>newsletter@bingo.ai</a>{" "}
          with "Subscribe" in the subject line.
        </p>
      </div>
    </PageShell>
  );
}
