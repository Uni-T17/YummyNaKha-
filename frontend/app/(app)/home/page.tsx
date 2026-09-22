import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import { MenuUploader } from "@/components/home/menu-uploader";
import { TasteSummary } from "@/components/home/taste-summary";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col pb-28">
      <HomeHeader />
      <div className="flex flex-col gap-5 px-5 md:px-8 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
        <TasteSummary />
        <MenuUploader />
      </div>
    </main>
  );
}
