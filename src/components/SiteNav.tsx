import React from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/seo";

interface SiteNavProps {
  /** Path of the page currently being viewed, so it can be marked aria-current. */
  currentPath?: string;
}

/**
 * Site-wide navigation rendered on every page.
 *
 * Google picks sitelink candidates from pages that are linked consistently from
 * across the site using short, descriptive anchor text, so the labels here are
 * deliberately terse and match each page's <h1>.
 */
export default function SiteNav({ currentPath }: SiteNavProps) {
  return (
    <nav
      aria-label="Main"
      className="border-b border-gray-800 mb-6 pb-3 font-geist"
    >
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        <li>
          <Link
            href="/"
            aria-current={currentPath === "/" ? "page" : undefined}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Home
          </Link>
        </li>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              title={item.description}
              aria-current={currentPath === item.href ? "page" : undefined}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
