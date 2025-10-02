
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Wand2, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';

import { getRenderOptions } from '@/ai/flows/get-render-options';
import { parsePrompt, type ParsePromptOutput } from '@/ai/flows/parse-prompt';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import TileSelector from './tile-selector';
import { BeforeAfterSlider } from './before-after-slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PromptInput from './prompt-input';
import ChatView, { type ChatMessage } from './chat-view';

const formSchema = z.object({
  roomPhoto: z.any().refine(file => file instanceof File, 'Room photo is required.'),
  floorTile: z.string().min(1, 'Floor tile is required.'),
  wallTile: z.string().min(1, 'Wall tile is required.'),
  groutWidth: z.number().min(0).max(10).default(2),
  tileScale: z.number().min(0.5).max(2).default(1),
  tileOrientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
});

type FormValues = z.infer<typeof formSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function RoomVisualizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomPhotoPreview, setRoomPhotoPreview] = useState<string | null>("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
  const [selectedRender, setSelectedRender] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { toast } = useToast();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groutWidth: 2,
      tileScale: 1,
      tileOrientation: 'horizontal',
    },
  });

  const selectedFloorTileId = watch('floorTile');
  const selectedWallTileId = watch('wallTile');

  const floorTiles = PlaceHolderImages.filter(img => img.id.startsWith('floor-'));
  const wallTiles = PlaceHolderImages.filter(img => img.id.startsWith('wall-'));

  const handleRoomPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('roomPhoto', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVisualization = async (params: {
        floorTileId: string;
        wallTileId: string;
  }) => {
     setIsLoading(true);
     setError(null);
     setSelectedRender(null);
     
     const currentRoomPhoto = roomPhotoPreview;
     if (!currentRoomPhoto) {
        toast({
            variant: 'destructive',
            title: 'No Room Photo',
            description: 'Please upload a photo of your room first.',
        });
        setIsLoading(false);
        return;
     }

     try {
        const floorTile = PlaceHolderImages.find(t => t.id === params.floorTileId);
        const wallTile = PlaceHolderImages.find(t => t.id === params.wallTileId);

        if (!floorTile || !wallTile) throw new Error('Selected tile not found.');

        const result = await getRenderOptions({
            roomPhotoDataUri: currentRoomPhoto,
            floorTileDataUri: floorTile.imageUrl,
            wallTileDataUri: wallTile.imageUrl,
            // These are not in the new design, so using defaults
            groutWidth: 2,
            tileScale: 1,
            tileOrientation: 'horizontal'
        });

        const finalRender = result.renderOptions?.find(opt => opt && opt.startsWith('data:image'));
        
        if (finalRender) {
          setSelectedRender(finalRender);
        } else {
          throw new Error('AI failed to generate a valid image. Please try again.');
        }

     } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred.';
        setError(errorMessage);
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'system', content: `Error: ${errorMessage}` }]);
        toast({
            variant: 'destructive',
            title: 'Visualization Failed',
            description: errorMessage,
        });
     } finally {
        setIsLoading(false);
     }
  };

  const onSubmit = async (data: FormValues) => {
    await triggerVisualization({
        floorTileId: data.floorTile,
        wallTileId: data.wallTile,
    });
  };

  const handlePromptSubmit = async (prompt: string) => {
    const newMessages: ChatMessage[] = [
        ...messages,
        { id: `user-${Date.now()}`, role: 'user', content: prompt }
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    const result = await parsePrompt({ prompt });

    if (result.error) {
        setMessages([...newMessages, { id: `err-${Date.now()}`, role: 'system', content: result.error }]);
        setError(result.error)
        setIsLoading(false);
        return;
    }

    if (result.parsedIntent?.type === 'apply_textures') {
        const { args } = result.parsedIntent;
        const floorTile = args.floorTileSku || selectedFloorTileId;
        const wallTile = args.wallTileSku || selectedWallTileId;
        
        if(!floorTile || !wallTile) {
             const errorMsg = "Please select both a floor and a wall tile.";
             setMessages([...newMessages, { id: `err-${Date.now()}`, role: 'system', content: errorMsg }]);
             setError(errorMsg)
             setIsLoading(false);
             return;
        }

        await triggerVisualization({
            floorTileId: floorTile,
            wallTileId: wallTile,
        });
    }
  };

  const handleTileSelect = (tileId: string) => {
    const tile = PlaceHolderImages.find(t => t.id === tileId);
    if (!tile) return;

    if (tile.id.startsWith('floor-')) {
        setValue('floorTile', tile.id);
    } else if (tile.id.startsWith('wall-')) {
        setValue('wallTile', tile.id);
    }
    
    // Add tile name to prompt
    const currentPrompt = messages.findLast(m => m.role === 'user')?.content || "";
    const newPrompt = `${currentPrompt} ${tile.description}`.trim();

    const lastUserMessageIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserMessageIndex !== -1) {
        const newMessages = [...messages];
        newMessages[lastUserMessageIndex] = { ...newMessages[lastUserMessageIndex], content: newPrompt };
        setMessages(newMessages);
    } else {
        setMessages([...messages, { id: `user-${Date.now()}`, role: 'user', content: newPrompt }]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-4rem)]">
        {/* Left column - Image Preview */}
        <div className="lg:col-span-2 relative bg-neutral-100">
            {selectedRender && roomPhotoPreview ? (
                <BeforeAfterSlider beforeImage={roomPhotoPreview} afterImage={selectedRender} />
            ) : roomPhotoPreview ? (
                <Image src={roomPhotoPreview} alt="Room" layout="fill" objectFit="cover" />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-16 w-16" />
                        <p className="mt-4">Upload a room to get started</p>
                    </div>
                </div>
            )}
            {!selectedRender && roomPhotoPreview && (
              <div className="absolute bottom-4 left-4">
                <Button variant="outline" onClick={() => setSelectedRender(null)} className="bg-background/80 backdrop-blur-sm">
                    Reset View
                </Button>
              </div>
            )}
        </div>

        {/* Right column - Controls */}
        <div className="p-4 md:p-6 bg-card flex flex-col h-full overflow-y-auto">
            <div className="flex-shrink-0">
                <Button variant="outline" className="w-full mb-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Room
                </Button>

                <Tabs defaultValue="prompt">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="controls">Controls</TabsTrigger>
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                    </TabsList>
                    <TabsContent value="controls" className="pt-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-2 text-sm">Floor Tiles</h3>
                                <TileSelector tiles={floorTiles} selectedId={selectedFloorTileId} onSelect={(id) => setValue('floorTile', id)} />
                            </div>
                            <div>
                                <h3 className="font-medium mb-2 text-sm">Wall Tiles</h3>
                                <TileSelector tiles={wallTiles} selectedId={selectedWallTileId} onSelect={(id) => setValue('wallTile', id)} />
                            </div>
                        </form>
                    </TabsContent>
                    <TabsContent value="prompt" className="pt-4 space-y-4">
                      <PromptInput
                        onSubmit={handlePromptSubmit}
                        isLoading={isLoading}
                        currentPrompt={messages.findLast(m => m.role === 'user')?.content as string || ""}
                        setPrompt={(p) => {
                            const lastUserMessageIndex = messages.findLastIndex(m => m.role === 'user');
                            if (lastUserMessageIndex !== -1) {
                                const newMessages = [...messages];
                                newMessages[lastUserMessageIndex] = { ...newMessages[lastUserMessageIndex], content: p };
                                setMessages(newMessages);
                            } else {
                                setMessages([...messages, { id: `user-${Date.now()}`, role: 'user', content: p }]);
                            }
                        }}
                      />
                       <TileSelector tiles={[...floorTiles, ...wallTiles]} selectedId={undefined} onSelect={handleTileSelect} />
                    </TabsContent>
                </Tabs>
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="flex-shrink-0 pt-4">
                <Button 
                    size="lg" 
                    disabled={isLoading} 
                    className="w-full"
                    onClick={selectedRender ? () => {} : () => handlePromptSubmit(messages.findLast(m => m.role === 'user')?.content as string || "")}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? 'Visualizing...' : 'Visualize (1 Credit)'}
                </Button>
            </div>
        </div>
    </div>
  );
}