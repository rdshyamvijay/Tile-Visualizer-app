'use server';
/**
 * @fileOverview Applies a tile texture to a room image, segmenting it into floor and wall masks and applying selected tile textures with proper perspective, scale, and lighting.
 *
 * - visualizeTileInRoom - A function that handles the tile visualization process.
 * - VisualizeTileInRoomInput - The input type for the visualizeTileInRoom function.
 * - VisualizeTileInRoomOutput - The return type for the visualizeTileInRoom function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const VisualizeTileInRoomInputSchema = z.object({
  roomPhotoDataUri: z
    .string()
    .describe(
      "A photo of the room to be visualized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  floorTileDataUri: z
    .string()
    .describe(
      "A photo of the floor tile to be applied, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  wallTileDataUri: z
    .string()
    .describe(
      "A photo of the wall tile to be applied, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  groutWidth: z.number().describe('The width of the grout between tiles, in pixels.'),
  tileOrientation: z.string().describe('The orientation of the tiles (e.g., horizontal, vertical).'),
  tileScale: z.number().describe('The scale of the tiles.'),
});
export type VisualizeTileInRoomInput = z.infer<typeof VisualizeTileInRoomInputSchema>;

const VisualizeTileInRoomOutputSchema = z.object({
  renderedPhotoDataUri: z
    .string()
    .describe("The rendered photo with the applied tile textures, as a data URI."),
});
export type VisualizeTileInRoomOutput = z.infer<typeof VisualizeTileInRoomOutputSchema>;

export async function visualizeTileInRoom(input: VisualizeTileInRoomInput): Promise<VisualizeTileInRoomOutput> {
  return visualizeTileInRoomFlow(input);
}

const visualizeTileInRoomPrompt = ai.definePrompt({
  name: 'visualizeTileInRoomPrompt',
  input: {schema: VisualizeTileInRoomInputSchema},
  output: {schema: VisualizeTileInRoomOutputSchema},
  prompt: [
    {
      media: {url: '{{roomPhotoDataUri}}'},
    },
    {
      text: `Apply the textures to the floor and walls in the provided image.
Apply the following floor tile texture: {{media url=floorTileDataUri}}.
Apply the following wall tile texture: {{media url=wallTileDataUri}}.
Grout Width: {{{groutWidth}}}
Tile Orientation: {{{tileOrientation}}}
Tile Scale: {{{tileScale}}}`,
    },
  ],
  model: googleAI.model('googleai/gemini-2.5-flash-image-preview'),
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const visualizeTileInRoomFlow = ai.defineFlow(
  {
    name: 'visualizeTileInRoomFlow',
    inputSchema: VisualizeTileInRoomInputSchema,
    outputSchema: VisualizeTileInRoomOutputSchema,
  },
  async input => {
    const {media} = await visualizeTileInRoomPrompt(input);
    return {renderedPhotoDataUri: media.url!};
  }
);
