/**
 * The five explorable destinations. Every fact here is taken from existing
 * pages in this repository - nothing is invented for the 3D experience.
 */

export type DestinationId =
  | "lighthouse"
  | "innovation"
  | "harbour"
  | "port"
  | "radio";

export interface DestinationLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Destination {
  id: DestinationId;
  /** Chart designator shown in the HUD. */
  marker: string;
  name: string;
  subtitle: string;
  /** Primary portfolio route this destination represents. */
  href: string;
  /** World position on the XZ plane. */
  x: number;
  z: number;
  /** Radius of dry land, used for collision. */
  landRadius: number;
  /** Range at which the destination label and approach prompt appear. */
  discoverRadius: number;
  /** Range at which docking becomes available. */
  dockRadius: number;
  /** Bearing (radians) the cinematic camera looks from when docked. */
  dockAngle: number;
  summary: string;
  highlights: string[];
  links: DestinationLink[];
  /** UI accent, also used for the destination's navigation light. */
  accent: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "lighthouse",
    marker: "LH-01",
    name: "The Lighthouse",
    subtitle: "About",
    href: "/about",
    x: -106,
    z: -65,
    landRadius: 26,
    discoverRadius: 86,
    dockRadius: 44,
    dockAngle: Math.PI * 0.72,
    summary:
      "My background, computer engineering education, technical skills, and interests.",
    highlights: [
      "BASc, Computer Engineering - Queen's University",
      "Based in Toronto, Ontario, Canada",
      "PHP · JavaScript · React · Next.js · Python · PostgreSQL",
      "Off the keyboard: kitesurfing, mountain biking, hockey",
    ],
    links: [
      { label: "Read the full story", href: "/about" },
      { label: "Services", href: "/services" },
    ],
    accent: "#f2c572",
  },
  {
    id: "innovation",
    marker: "IN-02",
    name: "Innovation Island",
    subtitle: "Projects",
    href: "/projects",
    x: 114,
    z: -87,
    landRadius: 30,
    discoverRadius: 92,
    dockRadius: 48,
    dockAngle: Math.PI * 1.22,
    summary:
      "Software projects, including a machine-learning capstone, an equity research dashboard, and a loyalty rewards platform.",
    highlights: [
      "Calorie Prediction Network - ResNet-50 transfer learning capstone",
      "Equity Research & Market Dashboard - Amazon, Meta, Nvidia",
      "Cactus Loyalty App - React Native, Laravel, GitHub Actions CI/CD",
    ],
    links: [
      { label: "Browse the projects", href: "/projects" }
    ],
    accent: "#7fd4c1",
  },
  {
    id: "harbour",
    marker: "RH-03",
    name: "Rescue Harbour",
    subtitle: "Experience",
    href: "/resume",
    x: -121,
    z: 83,
    landRadius: 32,
    discoverRadius: 92,
    dockRadius: 50,
    dockAngle: Math.PI * 0.18,
    summary:
      "Experience in software development, technical leadership, and Canadian Coast Guard search and rescue.",
    highlights: [
      "Software Developer, Catalyst IT Canada - custom Moodle for universities and colleges",
      "Coxswain, Inshore Search and Rescue - Canadian Coast Guard",
      "Technical Oversight Consultant - MoveBuddy.com",
      "Tech Lead & Developer - Cactus Loyalty App",
    ],
    links: [{ label: "Open the résumé", href: "/resume" }],
    accent: "#ef8354",
  },
  {
    id: "port",
    marker: "TP-04",
    name: "The Trading Port",
    subtitle: "Equity research",
    href: "/dashboard",
    x: 124,
    z: 92,
    landRadius: 34,
    discoverRadius: 94,
    dockRadius: 52,
    dockAngle: Math.PI * 1.72,
    summary:
      "An interactive equity research dashboard with stock performance, earnings, financial metrics, and valuation data.",
    highlights: [
      "Covering AMZN · META · NVDA",
      "Earnings, margin, net income and valuation views",
      "Scheduled data pipeline - Python and GitHub Actions",
    ],
    links: [{ label: "Open the dashboard", href: "/dashboard" }],
    accent: "#9bb8e8",
  },
  {
    id: "radio",
    marker: "RP-05",
    name: "Radio Point",
    subtitle: "Contact",
    href: "/contact",
    x: 5,
    z: -167,
    landRadius: 22,
    discoverRadius: 86,
    dockRadius: 42,
    dockAngle: Math.PI * 0.98,
    summary:
      "Contact information, professional profiles, and ways to connect about software engineering and consulting.",
    highlights: [
      "niko.hoogeveen@gmail.com",
      "Toronto, Ontario, Canada (EST/EDT)",
      "Schedule a call on Cal.com",
    ],
    links: [
      { label: "Make contact", href: "/contact" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/niko-hoogeveen",
        external: true,
      },
    ],
    accent: "#e8e0cf",
  },
];

export const DESTINATION_BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d]));

/** Soft edge of the charted area; the boat is nudged back inside past this. */
export const WORLD_RADIUS = 290;

/** Where the boat starts, and where the reset control returns it to. */
export const START = { x: 0, z: 48, heading: Math.PI };
