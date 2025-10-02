
'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '../ui/card';

export type ChatMessage = {
  id: string;
  role: 'user' | 'system';
  content: React.ReactNode;
};

interface ChatViewProps {
  messages: ChatMessage[];
}

export default function ChatView({ messages }: ChatViewProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewPort = scrollAreaRef.current.querySelector('div');
                if (viewPort) viewPort.scrollTop = viewPort.scrollHeight;
             }
        }, 100);
    }
  }, [messages]);


  return (
    <ScrollArea className="h-[300px] w-full pr-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'system' && (
              <Avatar className="w-8 h-8 border">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <Card
              className={`max-w-[80%] p-0 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <CardContent className="p-3 text-sm">
                {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
              </CardContent>
            </Card>

             {message.role === 'user' && (
              <Avatar className="w-8 h-8 border">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
