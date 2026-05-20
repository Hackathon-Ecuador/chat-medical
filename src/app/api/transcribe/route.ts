// /api/transcribe/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('[Transcribe] OPENAI_API_KEY is missing');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const openAiFormData = new FormData();
    openAiFormData.append('file', new Blob([buffer]), file.name || 'audio.webm');
    openAiFormData.append('model', 'whisper-1');

    // 👇 SOLUCIÓN WHISPER: Forzamos el idioma y le damos contexto
    openAiFormData.append('language', 'es');
    openAiFormData.append(
      'prompt',
      'El usuario hablará en español de Ecuador. Puede incluir nombres propios en inglés o español como Henry, nombres de ciudades, o términos técnicos.',
    );

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openAiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
