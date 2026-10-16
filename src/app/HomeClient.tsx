"use client";
import dynamic from "next/dynamic";
const OpenWater = dynamic(() => import("@/components/OpenWater"), { ssr: false, loading: () => <main className="flex min-h-screen items-center justify-center bg-[#0b2636] text-[#d5ecf0]">Preparing the open water…</main> });
export default function HomeClient() { return <OpenWater />; }
