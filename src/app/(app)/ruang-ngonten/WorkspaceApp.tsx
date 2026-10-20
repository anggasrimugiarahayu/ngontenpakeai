"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { getBlueprintAction } from "@/app/actions/blueprint";
import ToolGrid from "./ToolGrid";

const ToolLoading = ({ title }: { title: string }) => (
  <div className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Memuat {title}...
    </p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
      Menyiapkan asisten AI dan sistem workspace
    </p>
  </div>
);

const AtmBuilderClient = dynamic(() => import("./atm-builder/AtmBuilderClient"), {
  loading: () => <ToolLoading title="ATM Content Builder" />,
  ssr: false,
});
const BioBuilderClient = dynamic(() => import("./bio-builder/BioBuilderClient"), {
  loading: () => <ToolLoading title="Bio Builder" />,
  ssr: false,
});
const CarouselBuilderClient = dynamic(() => import("./carousel-builder/CarouselBuilderClient"), {
  loading: () => <ToolLoading title="Carousel Prompt Builder" />,
  ssr: false,
});
const ContentCalendarClient = dynamic(() => import("./content-calendar/ContentCalendarClient"), {
  loading: () => <ToolLoading title="Content Calendar" />,
  ssr: false,
});
const EbookBuilderClient = dynamic(() => import("./ebook-builder/EbookBuilderClient"), {
  loading: () => <ToolLoading title="Ebook Prompt Builder" />,
  ssr: false,
});
const IdeaRoomsClient = dynamic(() => import("./idea-rooms/IdeaRoomsClient"), {
  loading: () => <ToolLoading title="Idea Rooms" />,
  ssr: false,
});
const MasterBlueprintClient = dynamic(() => import("./master-blueprint/MasterBlueprintClient"), {
  loading: () => <ToolLoading title="Master Blueprint" />,
  ssr: false,
});
const ScriptBuilderClient = dynamic(() => import("./script-builder/ScriptBuilderClient"), {
  loading: () => <ToolLoading title="Script Builder" />,
  ssr: false,
});

interface Props {
  hasBlueprint: boolean;
  dbFeatures: any[];
  isPro: boolean;
  isLoggedIn?: boolean;
  nicheReferences?: any[];
  userImage?: string | null;
}

export default function WorkspaceApp({ hasBlueprint, dbFeatures, isPro, isLoggedIn, nicheReferences, userImage }: Props) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);

  const { data: blueprintData } = useSWR(isLoggedIn ? "blueprint" : null, getBlueprintAction);
  const activeHasBlueprint = hasBlueprint || !!blueprintData?.aiResult || !!blueprintData;

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("app-shallow-navigate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("app-shallow-navigate", handleLocationChange);
    };
  }, []);
  
  const isDashboard = activePath === "/ruang-ngonten" || activePath === "/ruang-ngonten/";
  const isAtm = activePath.startsWith("/ruang-ngonten/atm-builder");
  const isBio = activePath.startsWith("/ruang-ngonten/bio-builder");
  const isCarousel = activePath.startsWith("/ruang-ngonten/carousel-builder");
  const isCalendar = activePath.startsWith("/ruang-ngonten/content-calendar");
  const isEbook = activePath.startsWith("/ruang-ngonten/ebook-builder");
  const isIdeaRooms = activePath.startsWith("/ruang-ngonten/idea-rooms");
  const isMasterBlueprint = activePath.startsWith("/ruang-ngonten/master-blueprint");
  const isScriptBuilder = activePath.startsWith("/ruang-ngonten/script-builder");

  const [visited, setVisited] = useState<Record<string, boolean>>({
    atm: isAtm,
    bio: isBio,
    carousel: isCarousel,
    calendar: isCalendar,
    ebook: isEbook,
    ideaRooms: isIdeaRooms,
    masterBlueprint: isMasterBlueprint,
    scriptBuilder: isScriptBuilder,
  });

  useEffect(() => {
    if (isAtm && !visited.atm) setVisited(v => ({ ...v, atm: true }));
    if (isBio && !visited.bio) setVisited(v => ({ ...v, bio: true }));
    if (isCarousel && !visited.carousel) setVisited(v => ({ ...v, carousel: true }));
    if (isCalendar && !visited.calendar) setVisited(v => ({ ...v, calendar: true }));
    if (isEbook && !visited.ebook) setVisited(v => ({ ...v, ebook: true }));
    if (isIdeaRooms && !visited.ideaRooms) setVisited(v => ({ ...v, ideaRooms: true }));
    if (isMasterBlueprint && !visited.masterBlueprint) setVisited(v => ({ ...v, masterBlueprint: true }));
    if (isScriptBuilder && !visited.scriptBuilder) setVisited(v => ({ ...v, scriptBuilder: true }));
  }, [isAtm, isBio, isCarousel, isCalendar, isEbook, isIdeaRooms, isMasterBlueprint, isScriptBuilder, visited]);

  return (
    <>
      <div style={{ display: isDashboard ? "block" : "none", width: "100%" }}>
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 py-4 md:py-6 animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-4 md:mb-8">
            <div className="space-y-3 flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Mau mulai dari mana?
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
                Pilih asisten AI andalanmu di bawah ini untuk mulai meracik ide, menulis skrip, hingga menyusun strategi konten.
              </p>
            </div>
          </div>
          <ToolGrid hasBlueprint={activeHasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} />
        </div>
      </div>
      
      <div style={{ display: isAtm ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.atm && <AtmBuilderClient />}
      </div>
      <div style={{ display: isBio ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.bio && <BioBuilderClient />}
      </div>
      <div style={{ display: isCarousel ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.carousel && <CarouselBuilderClient />}
      </div>
      <div style={{ display: isCalendar ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.calendar && <ContentCalendarClient />}
      </div>
      <div style={{ display: isEbook ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.ebook && <EbookBuilderClient />}
      </div>
      <div style={{ display: isIdeaRooms ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.ideaRooms && <IdeaRoomsClient />}
      </div>
      <div style={{ display: isMasterBlueprint ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.masterBlueprint && <MasterBlueprintClient nicheReferences={nicheReferences} />}
      </div>
      <div style={{ display: isScriptBuilder ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        {visited.scriptBuilder && <ScriptBuilderClient />}
      </div>
    </>
  );
}
