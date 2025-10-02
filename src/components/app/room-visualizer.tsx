
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
import type { ImagePlaceholder } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import TileSelector from './tile-selector';
import { BeforeAfterSlider } from './before-after-slider';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PromptInput from './prompt-input';
import ChatView, { type ChatMessage } from './chat-view';
import { cn } from '@/lib/utils';

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
  const [roomPhotoPreview, setRoomPhotoPreview] = useState<string | null>(null);
  const [renderOptions, setRenderOptions] = useState<string[]>([]);
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
        groutWidth: number;
        tileScale: number;
        tileOrientation: 'horizontal' | 'vertical';
  }) => {
     setIsLoading(true);
     setError(null);
     setRenderOptions([]);
     setSelectedRender(null);
     
     if (!watch('roomPhoto')) {
        toast({
            variant: 'destructive',
            title: 'No Room Photo',
            description: 'Please upload a photo of your room first.',
        });
        setIsLoading(false);
        return;
     }

     try {
        const roomPhotoDataUri = await fileToDataUri(watch('roomPhoto'));
        const floorTile = PlaceHolderImages.find(t => t.id === params.floorTileId);
        const wallTile = PlaceHolderImages.find(t => t.id === params.wallTileId);

        if (!floorTile || !wallTile) throw new Error('Selected tile not found.');

        const result = await getRenderOptions({
            roomPhotoDataUri,
            floorTileDataUri: floorTile.imageUrl,
            wallTileDataUri: wallTile.imageUrl,
            groutWidth: params.groutWidth,
            tileScale: params.tileScale,
            tileOrientation: params.tileOrientation,
        });

        if (result.renderOptions && result.renderOptions.length > 0) {
            const validOptions = result.renderOptions.filter(opt => opt && opt.startsWith('data:image'));
            if (validOptions.length > 0) {
              setRenderOptions(validOptions);
            } else {
              throw new Error('AI failed to generate valid images. Please try again.');
            }
        } else {
            throw new Error('No render options were returned. The visualization might have failed.');
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
        groutWidth: data.groutWidth,
        tileScale: data.tileScale,
        tileOrientation: data.tileOrientation,
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
        await triggerVisualization({
            floorTileId: args.floorTileSku || selectedFloorTileId,
            wallTileId: args.wallTileSku || selectedWallTileId,
            groutWidth: args.groutWidthMm ? args.groutWidthMm / 10 : watch('groutWidth'), // approximate conversion
            tileScale: args.scaleMetersPerRepeat || watch('tileScale'), // Needs a real conversion
            tileOrientation: args.orientationDeg === 90 ? 'vertical' : 'horizontal' // simplified
        });
    }
    // Handle other intents or ambiguous results in a real implementation
  };


  const VisualizationStep = ({ number, title, children, className }: { number?: number, title: string, children: React.ReactNode, className?: string }) => (
    <Card className={cn("overflow-hidden h-fit", className)}>
      <CardHeader className="flex flex-row items-center gap-4 bg-muted/50">
        {number && <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">{number}</div>}
        <div>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <section id="visualizer" className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
            <VisualizationStep title="1. Upload Your Room">
                <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted">
                    {roomPhotoPreview ? (
                    <Image src={roomPhotoPreview} alt="Room preview" width={600} height={400} className="object-cover w-full h-full" />
                    ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="mx-auto h-12 w-12" />
                        <p>Image preview will appear here</p>
                    </div>
                    )}
                </div>
                <div className="mt-4 space-y-2 max-w-sm mx-auto">
                    <Label htmlFor="room-photo-input" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose a Photo
                    </Label>
                    <Input id="room-photo-input" type="file" accept="image/*" onChange={handleRoomPhotoChange} className="sr-only" />
                    {errors.roomPhoto && <p className="text-sm font-medium text-destructive">{errors.roomPhoto.message as string}</p>}
                </div>
            </VisualizationStep>
            
            <VisualizationStep title="2. Design Your Space">
                <Tabs defaultValue="controls">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="controls">Controls</TabsTrigger>
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                    </TabsList>
                    <TabsContent value="controls" className="pt-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium mb-2">Floor Tiles</h3>
                                    <TileSelector tiles={floorTiles} selectedId={selectedFloorTileId} onSelect={(id) => setValue('floorTile', id)} />
                                    {errors.floorTile && <p className="mt-2 text-sm font-medium text-destructive">{errors.floorTile.message}</p>}
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Wall Tiles</h3>
                                    <TileSelector tiles={wallTiles} selectedId={selectedWallTileId} onSelect={(id) => setValue('wallTile', id)} />
                                    {errors.wallTile && <p className="mt-2 text-sm font-medium text-destructive">{errors.wallTile.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Controller control={control} name="groutWidth" render={({ field }) => (
                                        <>
                                        <Label htmlFor="grout-width">Grout Width: {field.value}px</Label>
                                        <Slider id="grout-width" value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0} max={10} step={1} />
                                        </>
                                    )} />
                                </div>
                                <div className="space-y-3">
                                    <Controller control={control} name="tileScale" render={({ field }) => (
                                        <>
                                        <Label htmlFor="tile-scale">Tile Scale: {field.value}x</Label>
                                        <Slider id="tile-scale" value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0.5} max={2} step={0.1} />
                                        </>
                                    )} />
                                </div>
                                <div className="space-y-3">
                                    <Controller control={control} name="tileOrientation" render={({ field }) => (
                                        <>
                                        <Label>Tile Orientation</Label>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                            <Label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="horizontal" /> Horizontal</Label>
                                            <Label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="vertical" /> Vertical</Label>
                                        </RadioGroup>
                                        </>
                                    )} />
                                </div>
                            </div>

                            <div className="flex justify-center pt-8">
                                <Button type="submit" size="lg" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[200px]">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-5 w-5" />
                                )}
                                {isLoading ? 'Visualizing...' : 'Visualize'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                    <TabsContent value="prompt" className="pt-4 space-y-4">
                        <ChatView messages={messages} />
                        <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />
                    </TabsContent>
                </Tabs>
            </VisualizationStep>
        </div>

        <VisualizationStep title="3. See The Result" className="md:col-span-2">
            {isLoading && (
                <div className="text-center my-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 font-medium">Our AI is working its magic...</p>
                <p className="text-muted-foreground">This can take up to a minute.</p>
                </div>
            )}

            {error && !isLoading && (
            <div className="text-center my-12">
                <Card className="max-w-md mx-auto bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button variant="destructive" className="mt-4" onClick={() => handleSubmit(onSubmit)()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
            )}
            
            {!isLoading && !error && renderOptions.length === 0 && !selectedRender && (
                    <div className="text-center text-muted-foreground p-4 h-64 flex flex-col items-center justify-center">
                    <Wand2 className="mx-auto h-12 w-12" />
                    <p>Your visualization result will appear here</p>
                </div>
            )}

            {renderOptions.length > 0 && !isLoading && !selectedRender && (
            <div className="my-8">
                <div className="text-center mb-4">
                <h3 className="font-headline text-2xl font-bold tracking-tighter">Choose Your Favorite Render</h3>
                <p className="text-muted-foreground">The AI generated a few options. Pick one to see the full before & after.</p>
                </div>
                <Carousel opts={{ align: "start", loop: false }} className="w-full max-w-full mx-auto">
                <CarouselContent className="-ml-2">
                    {renderOptions.map((option, index) => (
                    <CarouselItem key={index} className="pl-2 md:basis-1/2">
                        <div className="p-1">
                        <Card className="overflow-hidden group cursor-pointer" onClick={() => setSelectedRender(option)}>
                            <CardContent className="p-0 aspect-video relative">
                            <Image src={option} alt={`Render option ${index + 1}`} layout="fill" objectFit="cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-white text-lg font-bold flex items-center gap-2">
                                <CheckCircle />
                                Select this Render
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                </Carousel>
            </div>
            )}

            {selectedRender && roomPhotoPreview && (
            <div className="my-8">
                <div className="text-center mb-4">
                <h3 className="font-headline text-2xl font-bold tracking-tighter">Your Vision, Realized</h3>
                <p className="text-muted-foreground">Use the slider to compare.</p>
                </div>
                <BeforeAfterSlider
                beforeImage={roomPhotoPreview}
                afterImage={selectedRender}
                />
                <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setSelectedRender(null)}>Back to Options</Button>
                </div>
            </div>
            )}
        </VisualizationStep>
      </div>
    </section>
  );
}

    