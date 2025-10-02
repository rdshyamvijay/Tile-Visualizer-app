
import AppHeader from '@/components/app/header';
import RoomVisualizer from '@/components/app/room-visualizer';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <RoomVisualizer />
      </main>
    </div>
  );
}
