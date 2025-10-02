"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const onMouseMove = (event: MouseEvent) => handleMove(event.clientX);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const onTouchMove = (event: TouchEvent) => handleMove(event.touches[0].clientX);
    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = afterImage;
    link.download = 'tilevision-render.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    // Sharing logic would go here, e.g., using navigator.share or copying a link
    alert("Sharing functionality to be implemented.");
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
        <div ref={containerRef} className="relative w-full h-full">
            <Image
                src={beforeImage}
                alt="Before"
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
                priority
            />
            <div
                className="absolute top-0 left-0 h-full w-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <Image
                src={afterImage}
                alt="After"
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
                priority
                />
            </div>
            <div
                className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize backdrop-blur-sm"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M13 18L18 12L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 6L6 12L11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
            </div>
        </div>
        <div className="absolute bottom-4 right-4 flex flex-wrap gap-2 justify-center">
            <Button onClick={handleDownload} variant="secondary"><Download className="mr-2"/>Download</Button>
            <Button variant="secondary" onClick={handleShare}><Share2 className="mr-2"/>Share</Button>
        </div>
    </div>
  );
}
