"use client";

import { usePathname } from "next/navigation";
import AtmBuilderClient from "./atm-builder/AtmBuilderClient";
import BioBuilderClient from "./bio-builder/BioBuilderClient";
import CarouselBuilderClient from "./carousel-builder/CarouselBuilderClient";
import ContentCalendarClient from "./content-calendar/ContentCalendarClient";
import EbookBuilderClient from "./ebook-builder/EbookBuilderClient";
import IdeaRoomsClient from "./idea-rooms/IdeaRoomsClient";
import MasterBlueprintClient from "./master-blueprint/MasterBlueprintClient";
import ScriptBuilderClient from "./script-builder/ScriptBuilderClient";
import ToolGrid from "./ToolGrid";

interface Props {
  hasBlueprint: boolean;
  dbFeatures: any[];
  isPro: boolean;
}

export default function WorkspaceApp({ hasBlueprint, dbFeatures, isPro }: Props) {
  const pathname = usePathname();
  
  const isDashboard = pathname === "/ruang-ngonten";
  const isAtm = pathname.startsWith("/ruang-ngonten/atm-builder");
  const isBio = pathname.startsWith("/ruang-ngonten/bio-builder");
  const isCarousel = pathname.startsWith("/ruang-ngonten/carousel-builder");
  const isCalendar = pathname.startsWith("/ruang-ngonten/content-calendar");
  const isEbook = pathname.startsWith("/ruang-ngonten/ebook-builder");
  const isIdeaRooms = pathname.startsWith("/ruang-ngonten/idea-rooms");
  const isMasterBlueprint = pathname.startsWith("/ruang-ngonten/master-blueprint");
  const isScriptBuilder = pathname.startsWith("/ruang-ngonten/script-builder");

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
          <ToolGrid hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} />
        </div>
      </div>
      
      <div style={{ display: isAtm ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <AtmBuilderClient />
      </div>
      <div style={{ display: isBio ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <BioBuilderClient />
      </div>
      <div style={{ display: isCarousel ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <CarouselBuilderClient />
      </div>
      <div style={{ display: isCalendar ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <ContentCalendarClient />
      </div>
      <div style={{ display: isEbook ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <EbookBuilderClient />
      </div>
      <div style={{ display: isIdeaRooms ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <IdeaRoomsClient />
      </div>
      <div style={{ display: isMasterBlueprint ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <MasterBlueprintClient />
      </div>
      <div style={{ display: isScriptBuilder ? "flex" : "none", flex: 1, height: "100%", width: "100%", flexDirection: "column" }}>
        <ScriptBuilderClient />
      </div>
    </>
  );
}
