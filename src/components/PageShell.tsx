import React from "react";
import PageParticles from "@/components/Particles";
import SiteNav from "@/components/SiteNav";
import Breadcrumbs, { BreadcrumbItem } from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

interface PageShellProps {
  particlesId: string;
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Standard page frame. Guarantees every page carries the same crawlable
 * navigation, breadcrumb trail, and footer link block.
 */
export default function PageShell({
  particlesId,
  currentPath,
  breadcrumbs,
  title,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <PageParticles id={particlesId} />
      <SiteNav currentPath={currentPath} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="animate-slide-in-top mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-xl text-gray-400">{subtitle}</p>
      </div>

      <div className="animate-slide-in-bottom space-y-8">{children}</div>

      <Footer />
    </div>
  );
}
