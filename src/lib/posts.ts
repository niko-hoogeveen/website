/**
 * Article content for /writing.
 *
 * Each post is an owned, indexable page that can rank for "Niko Hoogeveen" and
 * related queries. Add new entries here; the index page and the [slug] route
 * both read from this list.
 */

export interface Block {
  type: "h2" | "p" | "ul";
  text?: string;
  items?: string[];
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "moodle-database-optimization",
    title: "Cutting Moodle Database Load Without Touching Core",
    description:
      "How Niko Hoogeveen approaches Moodle performance work for university clients: finding the expensive queries, fixing them in plugin code, and proving the result.",
    datePublished: "2026-03-18",
    dateModified: "2026-03-18",
    keywords: [
      "Moodle performance",
      "Moodle database optimization",
      "Moodle plugin development",
      "Niko Hoogeveen",
    ],
    body: [
      {
        type: "p",
        text: "Moodle sites at universities tend to degrade in a predictable way. Enrolment grows, a few well-meaning plugins accumulate, reporting queries get written against tables that were never indexed for them, and one day the database becomes the bottleneck for everything. The instinct is to scale the hardware. That works, and it is expensive, and it postpones the problem rather than removing it.",
      },
      { type: "h2", text: "Start with evidence, not intuition" },
      {
        type: "p",
        text: "Before changing anything, I want a ranked list of the queries actually consuming database time. On a hosted Moodle that usually means the slow query log plus whatever statement-statistics view the database offers. The goal is a short list, ordered by total time consumed rather than by worst single execution — a query that takes 40 milliseconds but runs 200,000 times a day matters more than a nightly report that takes eight seconds.",
      },
      {
        type: "p",
        text: "Moodle makes attribution easier than most applications because query patterns map fairly cleanly onto specific plugin code. Once you have the statement text, finding the caller is usually a matter of searching for the table name and the distinctive parts of the WHERE clause.",
      },
      { type: "h2", text: "Fix it in plugin space" },
      {
        type: "p",
        text: "Modifying Moodle core is a maintenance liability: every upgrade becomes a merge conflict, and the client inherits a fork they cannot easily hand to another vendor. Almost every optimization I have needed has been achievable without it.",
      },
      {
        type: "ul",
        items: [
          "Replace per-row lookups inside loops with a single set-based query. This is the single most common win in custom Moodle reporting code.",
          "Use Moodle's Application Cache API for values that are expensive to compute and change rarely, and pick the cache definition scope deliberately rather than defaulting to session.",
          "Add indexes through the plugin's own install.xml and upgrade.php when the plugin owns the table. When it does not, revisit the query so it can use an index that already exists.",
          "Push filtering into SQL instead of retrieving broad result sets and filtering them in PHP.",
          "Batch scheduled task work so long-running jobs do not hold a connection and a transaction open across the entire run.",
        ],
      },
      { type: "h2", text: "Prove the change" },
      {
        type: "p",
        text: "An optimization that is not measured is a claim, not a result. I capture the same statistics before and after, over a comparable window of real traffic, and report total database time consumed by the affected code path rather than a single benchmarked execution. On hosted infrastructure that number converts directly into a cost figure, which is the form the client actually cares about.",
      },
      { type: "h2", text: "What this looks like for a client" },
      {
        type: "p",
        text: "The deliverable is not a patch. It is a short written finding — here is what was slow, here is why, here is the change, here is the measured difference, and here is what will make it regress. That last part matters most, because performance work that nobody documents gets undone by the next feature request.",
      },
    ],
  },
  {
    slug: "what-i-learned-building-an-equity-research-dashboard",
    title: "What I Learned Building an Equity Research Dashboard",
    description:
      "Niko Hoogeveen on building a static equity research dashboard: why earnings overlays changed how he reads price charts, and why the whole thing runs without a server.",
    datePublished: "2026-05-06",
    dateModified: "2026-05-06",
    keywords: [
      "equity research dashboard",
      "earnings analysis",
      "Next.js static site",
      "GitHub Actions data pipeline",
      "Niko Hoogeveen",
    ],
    body: [
      {
        type: "p",
        text: "I am a software engineer, not an analyst. I started building a stock dashboard because reading about equity research was not teaching me much, and building the tool forced me to answer questions I had been skimming past — what exactly is being compared when someone says a company beat expectations, and over what window does that beat show up in the price.",
      },
      { type: "h2", text: "Earnings overlays changed what I saw" },
      {
        type: "p",
        text: "A price chart on its own is close to useless for learning. The moment I overlaid earnings dates onto the price series, the chart started to have structure: gaps clustered around specific dates, and the size of the move stopped looking random. It became obvious that the interesting quantity is not the reported number but the distance between the reported number and what was expected.",
      },
      {
        type: "p",
        text: "That led directly to plotting EPS and revenue estimates against actuals with the percentage surprise, and then to the observation that surprise direction and price direction disagree often enough to be genuinely interesting. Guidance and positioning going into the print matter as much as the print.",
      },
      { type: "h2", text: "Valuation is context, not a signal" },
      {
        type: "p",
        text: "I added P/E, forward P/E, EV/EBITDA, and free cash flow multiples last, and my mental model of them shifted while doing it. In isolation a multiple says almost nothing. Placed next to the same company's own history and next to the surprise data, it starts to describe what the market is currently willing to pay for a given growth expectation — which is a much more useful frame than trying to read it as cheap or expensive.",
      },
      { type: "h2", text: "The architecture is deliberately boring" },
      {
        type: "ul",
        items: [
          "A scheduled GitHub Actions workflow fetches market and fundamental data on a fixed cadence.",
          "The workflow writes plain JSON files into the repository. Data changes are therefore version-controlled and diffable, which has caught upstream data errors more than once.",
          "The site is a Next.js static export. There is no server, no database, and no runtime API dependency.",
          "Because every page is prerendered, the dashboard pages are fully crawlable and load without waiting on a network round trip.",
        ],
      },
      {
        type: "p",
        text: "The cost of this stack is zero and the operational burden is close to it. The trade-off is that data is as fresh as the last scheduled run, which for a learning tool is entirely acceptable. If I needed intraday data the design would have to change, but I would want a much clearer reason before accepting a server.",
      },
      { type: "h2", text: "The real takeaway" },
      {
        type: "p",
        text: "Building the tool taught me more about equity research than reading about it did, and it taught me something about software too: the constraint of shipping a static site forced better decisions than an unconstrained architecture would have. You can see the result on the dashboard.",
      },
    ],
  },
  {
    slug: "technical-oversight-for-outsourced-development",
    title: "Technical Oversight: What to Check When You Outsource Development",
    description:
      "A practical checklist from Niko Hoogeveen for non-technical founders overseeing an external development partner, based on consulting engagements reviewing outsourced work.",
    datePublished: "2026-07-22",
    dateModified: "2026-07-22",
    keywords: [
      "technical oversight",
      "outsourced development",
      "code review consulting",
      "software due diligence",
      "Niko Hoogeveen",
    ],
    body: [
      {
        type: "p",
        text: "Most founders who outsource development are not equipped to evaluate what they are receiving. That is not a failure on their part — the work is genuinely opaque from outside. But the gap creates a specific failure mode: problems stay invisible until they surface as missed deadlines, and by then the cost of correcting course is high. Everything below can be checked without being able to read the code.",
      },
      { type: "h2", text: "Check estimates before work starts, not after" },
      {
        type: "p",
        text: "The cheapest intervention is reviewing tickets before implementation. A ticket that does not state what done looks like will be delivered to whatever definition is most convenient. A multi-week estimate on a task nobody can describe in two sentences is a signal that the requirement is not understood yet. Ask for the ticket to be split until each piece is describable.",
      },
      { type: "h2", text: "Ask for demonstrations, not status" },
      {
        type: "p",
        text: "Percentage-complete reporting is nearly information-free. Working software on a staging environment is not. Insist that progress is shown against the actual acceptance criteria, on an environment you can reach yourself. If a feature can only be demonstrated on a developer's machine, treat it as not delivered.",
      },
      { type: "h2", text: "Verify you own what you paid for" },
      {
        type: "ul",
        items: [
          "The source repository is under an account your company controls, and you are the owner rather than a collaborator.",
          "Infrastructure, domains, and third-party service accounts are registered to the company, not to individual developers.",
          "There is a written record of how to build, deploy, and roll back the application.",
          "Credentials and secrets are held somewhere that survives the vendor relationship ending.",
        ],
      },
      {
        type: "p",
        text: "This list sounds obvious and is very frequently wrong in practice. It is also the cheapest thing to fix early and the most expensive to fix during a dispute.",
      },
      { type: "h2", text: "Watch for recurring patterns, not individual defects" },
      {
        type: "p",
        text: "Every project has bugs. What matters is whether the same category of bug keeps returning. Repeated regressions in the same area usually indicate missing automated tests. Repeated scope disagreements usually indicate that requirements are being written after implementation starts. Treat the pattern as the defect and fix the process, rather than escalating each instance.",
      },
      { type: "h2", text: "Bring in an independent reviewer" },
      {
        type: "p",
        text: "A vendor reviewing its own work has an unavoidable conflict of interest, however honest the people involved are. A few hours a month from someone technical whose only obligation is to you changes the dynamic considerably — not adversarially, but because problems get raised while they are still cheap. That is the core of the technical oversight work I do.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}
