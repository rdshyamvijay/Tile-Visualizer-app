'use server';

/**
 * @fileOverview A Genkit flow that parses a user's natural language prompt to determine their intent for tile visualization.
 *
 * - parsePrompt - A function that parses the user's prompt and identifies the tiles and parameters for rendering.
 * - ParsePromptInput - The input type for the parsePrompt function.
 * - ParsePromptOutput - The return type for the parsePrompt function.
 */

import { ai } from '@/ai/genkit';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { z } from 'genkit';

const allTiles = PlaceHolderImages.map(t => ({ id: t.id, name: t.description, hint: t.imageHint }));

const ApplyTexturesParamsSchema = z.object({
  floorTileSku: z.string().optional().describe('The SKU of the tile to apply to the floor.'),
  wallTileSku: z.string().optional().describe('The SKU of the tile to apply to the wall.'),
  groutWidthMm: z.number().optional().describe('The width of the grout in millimeters.'),
  orientationDeg: z.number().optional().describe('The orientation of the tiles in degrees.'),
  scaleMetersPerRepeat: z.number().optional().describe('The scale of the tile pattern in meters per repeat.'),
});

const applyTexturesTool = ai.defineTool(
    {
      name: 'apply_textures',
      description: 'Apply tiles to room surfaces',
      inputSchema: ApplyTexturesParamsSchema,
      outputSchema: z.any(),
    },
    async (input) => input
  );

const ParsePromptInputSchema = z.object({
  prompt: z.string().describe('The user\'s natural language prompt.'),
  // In a real app, we'd pass orgId to fetch org-specific tiles.
  // orgId: z.string(),
});
export type ParsePromptInput = z.infer<typeof ParsePromptInputSchema>;


const tileIdentifier = z.object({
    userText: z.string().describe("The exact text the user provided for the tile."),
    matchedId: z.string().describe("The matched tile ID/SKU."),
    score: z.number().describe("The confidence score of the match."),
});

const AmbiguousMatchSchema = z.object({
    userText: z.string(),
    options: z.array(tileIdentifier),
});

const ParsedIntentSchema = z.object({
    type: z.literal("apply_textures"),
    args: ApplyTexturesParamsSchema,
});

const ParsePromptOutputSchema = z.object({
    parsedIntent: ParsedIntentSchema.optional(),
    ambiguousMatches: z.array(AmbiguousMatchSchema).optional(),
    error: z.string().optional(),
});
export type ParsePromptOutput = z.infer<typeof ParsePromptOutputSchema>;


const synonymMap: { [key: string]: string[] } = {
  marble: ['calacatta', 'carrara'],
  wood: ['oak', 'porcelain'],
  stone: ['terrazzo', 'concrete', 'granite'],
};

function normalizeText(text: string) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function findTile(text: string): { id: string, name: string } | null {
    const normalizedText = normalizeText(text);

    // 1. Exact SKU match
    const skuMatch = allTiles.find(t => t.id.toLowerCase() === normalizedText);
    if (skuMatch) return skuMatch;

    // 2. Exact name match
    const nameMatch = allTiles.find(t => normalizeText(t.name) === normalizedText);
    if (nameMatch) return nameMatch;

    // 3. Partial match / fuzzy search on name and hint
    // This is a simplified fuzzy search. A real implementation would use a library like fuse.js
    const words = normalizedText.split(' ');
    for (const tile of allTiles) {
        const tileText = normalizeText(`${tile.name} ${tile.hint}`);
        if (words.every(word => tileText.includes(word))) {
            return tile;
        }

        // check synonyms
        for(const word of words) {
            for(const key in synonymMap) {
                if(synonymMap[key].includes(word) && tileText.includes(key)) {
                    return tile;
                }
            }
        }
    }
    
    return null;
}

export async function parsePrompt(input: ParsePromptInput): Promise<ParsePromptOutput> {
  const llmResponse = await ai.generate({
    prompt: `You are an expert interior design assistant. Your goal is to understand the user's request and translate it into a structured command for our tile visualization tool.

User prompt: "${input.prompt}"

Available tiles:
${allTiles.map(t => `- ${t.name} (SKU: ${t.id})`).join('\n')}

Based on the user's prompt, call the 'apply_textures' tool with the correct parameters.
- Identify the tile names and map them to their SKUs.
- If the user specifies a tile for the "floor", use its SKU for 'floorTileSku'.
- If the user specifies a tile for the "wall", use its SKU for 'wallTileSku'.
- Extract any specified 'groutWidthMm', 'orientationDeg', or 'scaleMetersPerRepeat'.
`,
    tools: [applyTexturesTool],
    model: 'googleai/gemini-2.5-flash', 
  });

  const toolCall = llmResponse.toolCalls.find(tc => tc.toolName === 'apply_textures');

  if (!toolCall) {
    return { error: "I'm sorry, I couldn't understand that request. Could you please rephrase it?" };
  }
  
  const args = toolCall.args as z.infer<typeof ApplyTexturesParamsSchema>;

  // This is a simplified mapping. A real implementation would handle ambiguity.
  // The LLM should return SKUs, but if it returns names, we try to match them.
  if (typeof args.floorTileSku === 'string') {
      const tile = findTile(args.floorTileSku);
      if(tile) args.floorTileSku = tile.id;
      else return { error: `I couldn't find a tile matching '${args.floorTileSku}'.` };
  }
  if (typeof args.wallTileSku === 'string') {
      const tile = findTile(args.wallTileSku);
      if(tile) args.wallTileSku = tile.id;
      else return { error: `I couldn't find a tile matching '${args.wallTileSku}'.` };
  }

  return {
    parsedIntent: {
      type: "apply_textures",
      args: args,
    }
  };
}
