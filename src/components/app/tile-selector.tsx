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
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={cn(
              "shrink-0 rounded-md overflow-hidden relative cursor-pointer group aspect-square",
              selectedId === tile.id && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onSelect(tile.id)}
          >
            <Image
              src={tile.imageUrl}
              alt={tile.description}
              data-ai-hint={tile.imageHint}
              layout="fill"
              objectFit="cover"
              className="transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-2 left-2 text-white">
                <p className="text-xs font-bold">{tile.description}</p>
                <p className="text-[10px] opacity-80">{tile.id}</p>
            </div>
             {selectedId === tile.id && (
              <div className="absolute top-1 right-1 bg-primary rounded-full text-primary-foreground">
                <CheckCircle className="h-5 w-5 p-0.5" />
              </div>
            )}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
