import Link from 'next/link';
import { LayoutGrid, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <LayoutGrid className="h-6 w-6 text-primary" />
        <span className="font-headline text-xl font-bold">TileVision</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Admin Login
          </Link>
        </Button>
      </nav>
    </header>
  );
}
