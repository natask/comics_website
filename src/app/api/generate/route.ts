import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const output = await replicate.run(
      "natask/natnael_custom_model_generated:0b8fa59a19f2235347ed1c2ac5703aa2d1235ba88d3f4920008d357143ede549",
      {
        input: {
          prompt: prompt
        }
      }
    );

    // Validate the output
    if (!output) {
      return NextResponse.json(
        { error: 'No output from image generation' },
        { status: 500 }
      );
    }

    // Handle array output
    const imageUrl = Array.isArray(output) ? String(output[0]) : String(output);

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image URL generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 