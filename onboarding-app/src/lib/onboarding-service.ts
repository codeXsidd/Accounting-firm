import { createServiceClient } from './supabase';
import { buildOnboardingEmailHtml } from './email-template';

export async function saveClient(clientData: {
  name: string;
  email: string;
  notion_page_id: string;
  status?: string;
}) {
  const supabase = createServiceClient();
  const { name, email, notion_page_id, status } = clientData;

  // Check if client already exists
  const { data: existing, error } = await supabase
    .from('clients')
    .select('*')
    .eq('notion_page_id', notion_page_id)
    .maybeSingle();

  if (error) {
    console.error('Supabase existing check error:', error);
    throw error;
  }

  if (existing) {
    // Update status
    const { data, error: updateError } = await supabase
      .from('clients')
      .update({ status: status || existing.status, name, email })
      .eq('notion_page_id', notion_page_id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw updateError;
    }
    return { client: data, action: 'updated' };
  }

  // Create new client
  const { data, error: insertError } = await supabase
    .from('clients')
    .insert({ name, email, notion_page_id, status: status || 'In Progress' })
    .select()
    .single();

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    throw insertError;
  }
  return { client: data, action: 'created' };
}

export async function sendOnboardingEmail(params: {
  clientId: string;
  clientName: string;
  email: string;
  appUrl?: string;
}) {
  const { clientId, clientName, email } = params;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    throw new Error('Brevo API key not configured');
  }

  // Robust appUrl detection
  let finalAppUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || '';
  
  // If we're on production (Vercel) but the URL is localhost, override it
  if ((finalAppUrl.includes('localhost') || !finalAppUrl) && process.env.VERCEL_URL) {
    finalAppUrl = `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to localhost if nothing else found
  if (!finalAppUrl) finalAppUrl = 'http://localhost:3000';

  const onboardingLink = `${finalAppUrl}/onboarding/${clientId}`;
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
    throw new Error(`Brevo API error: ${errText}`);
  }

  return await brevoRes.json();
}
