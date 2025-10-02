"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CheckCircle } from 'lucide-react';

interface TileSelectorProps {
  tiles: ImagePlaceholder[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export default function TileSelector({ tiles, selectedId, onSelect }: TileSelectorProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {tiles.map((tile) => (
          <figure
            key={tile.id}
            className={cn(
              "shrink-0 rounded-md overflow-hidden relative cursor-pointer ring-offset-background ring-accent transition-all duration-200",
              selectedId === tile.id && "ring-4"
            )}
            onClick={() => onSelect(tile.id)}
          >
            <div className="w-24 h-24">
              <Image
                src={tile.imageUrl}
                alt={tile.description}
                data-ai-hint={tile.imageHint}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            {selectedId === tile.id && (
              <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              </div>
            )}
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
