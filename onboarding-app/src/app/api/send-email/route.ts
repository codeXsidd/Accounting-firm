import { NextRequest, NextResponse } from 'next/server';
import { sendOnboardingEmail } from '@/lib/onboarding-service';

export async function POST(req: NextRequest) {
  try {
    const { clientId, clientName, email } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const result = await sendOnboardingEmail({
      clientId,
      clientName,
      email,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
