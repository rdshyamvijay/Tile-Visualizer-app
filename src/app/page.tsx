import AppHeader from '@/components/app/header';
import RoomVisualizer from '@/components/app/room-visualizer';
import { LayoutGrid } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">AI-Powered Visualization</div>
                  <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    See Your Tiles in a New Light
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload a photo of your room and instantly see how our beautiful tiles transform your space. TileVision makes remodeling simple and fun.
                  </p>
                </div>
              </div>
               <div className="flex items-center justify-center">
                 <LayoutGrid className="h-48 w-48 text-primary/10" strokeWidth={0.5} />
               </div>
            </div>
          </div>
        </section>
        <RoomVisualizer />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 TileVision. All rights reserved.</p>
      </footer>
    </div>
  );
}
