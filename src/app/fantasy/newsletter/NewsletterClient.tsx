"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import PageParticles from "@/components/Particles";
import Breadcrumbs from "@/components/Breadcrumbs";
import PasswordGate from "@/components/fantasy/PasswordGate";
import NewsletterList from "@/components/fantasy/NewsletterList";
import NewsletterArticle from "@/components/fantasy/NewsletterArticle";
import {
  loadNewsletterIndex,
  loadNewsletterEntry,
} from "@/lib/fantasy/dataLoader";
import type { NewsletterEntry } from "@/types/fantasy";

export default function NewsletterClient() {
  const [index, setIndex] = useState<{ season: string; week: number }[]>([]);
  const [selected, setSelected] = useState<{
    season: string;
    week: number;
  } | null>(null);
  const [entry, setEntry] = useState<NewsletterEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIndex() {
      const entries = await loadNewsletterIndex();
      setIndex(entries);

      if (entries.length > 0) {
        // Default to the most recent entry
        const sorted = [...entries].sort((a, b) => {
          if (a.season !== b.season) return b.season.localeCompare(a.season);
          return b.week - a.week;
        });
        setSelected(sorted[0]);
      }

      setLoading(false);
    }

    loadIndex();
  }, []);

  useEffect(() => {
    async function loadEntry() {
      if (!selected) return;
      const data = await loadNewsletterEntry(selected.season, selected.week);
      setEntry(data);
    }

    loadEntry();
  }, [selected]);

  return (
    <PasswordGate>
      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        <PageParticles id="fantasy-newsletter-particles" />

        <Link
          href="/fantasy"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Fantasy Home
        </Link>

        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Fantasy", href: "/fantasy" },
            { name: "Newsletter", href: "/fantasy/newsletter" },
          ]}
        />

        <div className="animate-slide-in-top mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Weekly Newsletter
          </h1>
          <p className="text-xl text-gray-400">
            Auto-generated recaps, trends, and upcoming matchups
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse h-64 bg-gray-900/50 border border-gray-700 rounded-xl" />
        ) : index.length === 0 ? (
          <p className="text-gray-500">No newsletter entries available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <NewsletterList
                entries={index}
                selected={selected}
                onSelect={setSelected}
              />
            </div>
            <div className="md:col-span-3">
              {entry ? (
                <NewsletterArticle entry={entry} />
              ) : (
                <p className="text-gray-500">Loading entry...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PasswordGate>
  );
}
