import { NextRequest, NextResponse } from 'next/server';
import { buildOnboardingEmailHtml } from '@/lib/email-template';

export async function POST(req: NextRequest) {
  try {
    const { clientId, clientName, email } = await req.json();

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingLink = `${appUrl}/onboarding/${clientId}`;
    const htmlContent = buildOnboardingEmailHtml(clientName, onboardingLink);

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'AccountFlow Pro',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@accountflowpro.com',
        },
        to: [{ email, name: clientName }],
        subject: `🚀 Your Onboarding is Ready, ${clientName}!`,
        htmlContent,
        tags: ['onboarding', 'automated'],
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      return NextResponse.json(
        { error: `Brevo API error: ${errText}` },
        { status: 502 }
      );
    }

    const result = await brevoRes.json();
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      onboardingLink,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
