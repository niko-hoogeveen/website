"use client";

import dynamic from "next/dynamic";
import LoadingView from "@/components/open-water/LoadingView";

const OpenWater = dynamic(() => import("@/components/open-water/OpenWater"), {
  ssr: false,
  loading: () => <LoadingView />,
});

export default function HomeClient() {
  return <OpenWater />;
}
