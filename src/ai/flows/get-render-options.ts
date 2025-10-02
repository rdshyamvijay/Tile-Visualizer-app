'use server';

/**
 * @fileOverview A Genkit flow that generates multiple rendering options for tile application in a room image.
 *
 * - getRenderOptions - A function that generates multiple rendering options based on the input image and tile designs.
 * - GetRenderOptionsInput - The input type for the getRenderOptions function.
 * - GetRenderOptionsOutput - The return type for the getRenderOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetRenderOptionsInputSchema = z.object({
  roomPhotoDataUri: z
    .string()
    .describe(
      'A photo of the room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' +
        'This image will be used as the base for applying the tile textures.'
    ),
  floorTileDataUri: z
    .string()
    .describe(
      'A photo of the floor tile, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' +
        'This texture will be applied to the floor in the room photo.'
    ),
  wallTileDataUri: z
    .string()
    .describe(
      'A photo of the wall tile, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' +
        'This texture will be applied to the walls in the room photo.'
    ),
  groutWidth: z.number().optional().describe('The width of the grout between tiles, in pixels.'),
  tileOrientation: z.string().optional().describe('The orientation of the tiles (e.g., horizontal, vertical).'),
  tileScale: z.number().optional().describe('The scale of the tiles relative to the room.'),
});

export type GetRenderOptionsInput = z.infer<typeof GetRenderOptionsInputSchema>;

const GetRenderOptionsOutputSchema = z.object({
  renderOptions: z.array(
    z.string().describe(
      'An array of rendered images as data URIs, each representing a different rendering option with the applied tile textures.'
    )
  ),
});

export type GetRenderOptionsOutput = z.infer<typeof GetRenderOptionsOutputSchema>;

export async function getRenderOptions(input: GetRenderOptionsInput): Promise<GetRenderOptionsOutput> {
  return getRenderOptionsFlow(input);
}

const renderOptionsPrompt = ai.definePrompt({
  name: 'renderOptionsPrompt',
  input: {schema: GetRenderOptionsInputSchema},
  output: {schema: GetRenderOptionsOutputSchema},
  prompt: `You are an AI assistant specializing in generating various rendering options for applying tile textures to a room image.

  Given a room photo, floor tile texture, and wall tile texture, generate three different rendering options with slightly varying perspectives,
  lighting, and tile alignments. The goal is to provide the user with a diverse set of choices to select the most visually appealing and realistic rendering.

  Each rendering option should apply the floor and wall tile textures to the room image with proper perspective, scale, and lighting.
  Consider varying the grout width, tile orientation, and tile scale slightly between the options to create distinct looks.

  Present the rendered images as data URIs in the renderOptions array.

  Room Photo: {{media url=roomPhotoDataUri}}
  Floor Tile Texture: {{media url=floorTileDataUri}}
  Wall Tile Texture: {{media url=wallTileDataUri}}
  Grout Width: {{{groutWidth}}}
  Tile Orientation: {{{tileOrientation}}}
  Tile Scale: {{{tileScale}}}
  `,
});

const getRenderOptionsFlow = ai.defineFlow(
  {
    name: 'getRenderOptionsFlow',
    inputSchema: GetRenderOptionsInputSchema,
    outputSchema: GetRenderOptionsOutputSchema,
  },
  async input => {
    const renderOption1 = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.roomPhotoDataUri}},
        {text: `Apply the floor tile texture to the floor with a grout width of ${input.groutWidth || 2}, a horizontal tile orientation, and a tile scale of ${input.tileScale || 1}.  Apply the wall tile texture to the wall with a grout width of ${input.groutWidth || 2}, a horizontal tile orientation, and a tile scale of ${input.tileScale || 1}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    const renderOption2 = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.roomPhotoDataUri}},
        {text: `Apply the floor tile texture to the floor with a grout width of ${input.groutWidth || 3}, a vertical tile orientation, and a tile scale of ${input.tileScale || 1.2}. Apply the wall tile texture to the wall with a grout width of ${input.groutWidth || 3}, a vertical tile orientation, and a tile scale of ${input.tileScale || 1.2}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    const renderOption3 = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.roomPhotoDataUri}},
        {text: `Apply the floor tile texture to the floor with a grout width of ${input.groutWidth || 1}, a horizontal tile orientation, and a tile scale of ${input.tileScale || 0.8}. Apply the wall tile texture to the wall with a grout width of ${input.groutWidth || 1}, a horizontal tile orientation, and a tile scale of ${input.tileScale || 0.8}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });


    return {
      renderOptions: [
        renderOption1.media?.url || '',
        renderOption2.media?.url || '',
        renderOption3.media?.url || '',
      ],
    };
  }
);
