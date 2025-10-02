'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  currentPrompt: string;
  setPrompt: (prompt: string) => void;
}

export default function PromptInput({ onSubmit, isLoading, currentPrompt, setPrompt }: PromptInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPrompt.trim() && !isLoading) {
      onSubmit(currentPrompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          value={currentPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Apply Ocean Blue Subway on the floor of the room."
          className="pr-4 min-h-[60px] bg-neutral-100"
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
              }
          }}
        />
      </div>
    </form>
  );
}
