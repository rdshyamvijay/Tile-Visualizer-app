import Link from 'next/link';
import { LayoutGrid, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-8 border-b bg-card px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <LayoutGrid className="h-6 w-6 text-primary" />
        <span className="font-headline text-xl font-bold">TileVision</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-foreground hover:text-foreground/80">Dashboard</Link>
          <Link href="/tiles" className="text-muted-foreground hover:text-foreground/80">Tiles</Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <Badge variant="outline" className="hidden sm:flex items-center gap-2 py-1.5 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary"><path d="M21.75 6.75a.75.75 0 0 0-.75-.75h-18a.75.75 0 0 0 0 1.5h18a.75.75 0 0 0 .75-.75Zm0 10.5a.75.75 0 0 0-.75-.75h-18a.75.75 0 0 0 0 1.5h18a.75.75 0 0 0 .75-.75Z M2.25 12a.75.75 0 0 1 .75-.75h18a.75.75 0 0 1 0 1.5h-18a.75.75 0 0 1-.75-.75Z"></path></svg>
            <span>10 Credits</span>
        </Badge>
        <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
            <span className="sr-only">Toggle Theme</span>
        </Button>
        <Avatar className="h-9 w-9">
            <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" alt="User Avatar" />
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
