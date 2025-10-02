'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '../ui/badge';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const topTiles = PlaceHolderImages.slice(0, 6);

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
      setPrompt('');
    }
  };
  
  const handleQuickChipClick = (tileName: string) => {
    setPrompt(currentPrompt => `${currentPrompt} ${tileName}`.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-1">
                {topTiles.map((tile) => (
                    <Badge 
                        key={tile.id} 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => handleQuickChipClick(tile.description)}
                    >
                        {tile.description}
                    </Badge>
                ))}
            </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., apply Calacatta Gold on floor, Confetti Terrazzo on wall, grout 3 mm."
          className="pr-24 min-h-[80px]"
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
              }
          }}
        />
        <Button
          type="submit"
          size="sm"
          className="absolute bottom-2 right-2"
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
                <Wand2 className="mr-2 h-4 w-4" />
                <span>Visualize <span className="opacity-70">(1 credit)</span></span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
