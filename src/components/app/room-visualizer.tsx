"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Wand2, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';

import { getRenderOptions } from '@/ai/flows/get-render-options';
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

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setRenderOptions([]);
    setSelectedRender(null);

    try {
      const roomPhotoDataUri = await fileToDataUri(data.roomPhoto);
      
      const floorTile = PlaceHolderImages.find(t => t.id === data.floorTile);
      const wallTile = PlaceHolderImages.find(t => t.id === data.wallTile);

      if (!floorTile || !wallTile) {
        throw new Error('Selected tile not found.');
      }
      
      // We don't need to convert placeholder images, they are URLs.
      // But for real use case with user-uploaded tiles, we would need:
      // const floorTileDataUri = await ...
      // const wallTileDataUri = await ...
      
      const result = await getRenderOptions({
        roomPhotoDataUri,
        floorTileDataUri: floorTile.imageUrl,
        wallTileDataUri: wallTile.imageUrl,
        groutWidth: data.groutWidth,
        tileScale: data.tileScale,
        tileOrientation: data.tileOrientation,
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
      toast({
        variant: 'destructive',
        title: 'Visualization Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const VisualizationStep = ({ number, title, children }: { number: number, title: string, children: React.ReactNode }) => (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 bg-muted/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">{number}</div>
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
      <div className="container px-4 md:px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <VisualizationStep number={1} title="Upload Your Room">
              <div className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="room-photo-input" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose a Photo
                  </Label>
                  <Input id="room-photo-input" type="file" accept="image/*" onChange={handleRoomPhotoChange} className="sr-only" />
                  {errors.roomPhoto && <p className="text-sm font-medium text-destructive">{errors.roomPhoto.message as string}</p>}
                </div>
              </div>
            </VisualizationStep>

            <VisualizationStep number={2} title="Select Your Tiles">
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
            </VisualizationStep>

            <VisualizationStep number={3} title="Customize">
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
            </VisualizationStep>
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

        {isLoading && (
          <div className="text-center mt-12">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 font-medium">Our AI is working its magic...</p>
            <p className="text-muted-foreground">This can take up to a minute.</p>
          </div>
        )}

        {error && !isLoading && (
           <div className="text-center mt-12">
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

        {renderOptions.length > 0 && !isLoading && !selectedRender && (
          <div className="mt-12 md:mt-24">
            <div className="text-center mb-8">
              <h2 className="font-headline text-3xl font-bold tracking-tighter">Choose Your Favorite Render</h2>
              <p className="text-muted-foreground">The AI has generated a few options for you. Pick one to see the full before & after.</p>
            </div>
            <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {renderOptions.map((option, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
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
          <div className="mt-12 md:mt-24">
             <div className="text-center mb-8">
              <h2 className="font-headline text-3xl font-bold tracking-tighter">Your Vision, Realized</h2>
              <p className="text-muted-foreground">Use the slider to compare. You can also re-render with tweaks or try another option.</p>
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

      </div>
    </section>
  );
}
