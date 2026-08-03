import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

// ============================================================
// Deze route wordt aangeroepen door een Sanity-webhook telkens als
// je content publiceert in de Studio. Zonder deze route zou de
// site pas na maximaal 60 seconden (de ISR-revalidatie-tijd)
// bijwerken; met deze route gebeurt het binnen enkele seconden na
// publiceren.
//
// Instellen: zie de uitleg in het antwoord hieronder ("Stap 6:
// automatische updates instellen") voor hoe je deze URL koppelt
// aan een webhook in je Sanity-project.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Ongeldige handtekening' }, { status: 401 });
    }

    if (!body?._type) {
      return NextResponse.json({ message: 'Geen document-type in payload' }, { status: 400 });
    }

    // Alle content leeft momenteel op de homepage (single-page
    // site), dus elke wijziging revalideert simpelweg "/".
    revalidatePath('/');

    return NextResponse.json({
      revalidated: true,
      type: body._type,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Revalidatie mislukt', error: (err as Error).message },
      { status: 500 }
    );
  }
}
