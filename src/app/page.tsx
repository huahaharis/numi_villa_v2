import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { RightPanel } from "@/components/RightPanel";

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden text-gray-900">
      <div className="w-full h-full flex bg-white relative">
        <Sidebar />
        <div className="flex flex-1 overflow-hidden">
          <MainContent />
          <RightPanel />
        </div>
      </div>
    </main>
  );
}
