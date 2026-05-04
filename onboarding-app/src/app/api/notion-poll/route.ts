import { NextResponse } from 'next/server';
import { saveClient, sendOnboardingEmail } from '@/lib/onboarding-service';

// Notion poll endpoint - fetches DB and triggers onboarding for new deals
export async function GET() {
  try {
    const notionApiKey = process.env.NOTION_API_KEY;
    const notionDbId = process.env.NOTION_DATABASE_ID;

    if (!notionApiKey || !notionDbId) {
      return NextResponse.json(
        { error: 'Notion credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching Notion database...');
    // Fetch Notion database
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${notionDbId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Deal Closed',
            checkbox: { equals: true },
          },
        }),
      }
    );

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion API Error:', err);
      return NextResponse.json(
        { error: `Notion API error: ${err}` },
        { status: 502 }
      );
    }

    const notionData = await notionRes.json();
    const pages = notionData.results || [];
    console.log(`Found ${pages.length} pages with Deal Closed = true`);

    const triggered: string[] = [];
    const errors: string[] = [];

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    for (const page of pages) {
      try {
        const props = (page as any).properties;
        
        // Skip if already in progress or completed
        const status = props['Onboarding Status']?.select?.name || '';
        console.log(`Page ${page.id} status: "${status}"`);
        if (status === 'In Progress' || status === 'Completed') {
          continue;
        }

        const clientName =
          props['Client Name']?.title?.[0]?.plain_text || '';
        const email =
          props['Email']?.email ||
          props['@ Email']?.email ||
          props['Email']?.rich_text?.[0]?.plain_text ||
          props['@ Email']?.rich_text?.[0]?.plain_text ||
          '';

        console.log(`Processing trigger for ${clientName} (${email})`);

        if (!clientName || !email) {
          errors.push(`Page ${page.id}: missing name or email`);
          continue;
        }

        // 1. Update Notion → In Progress
        console.log(`Updating Notion status for ${clientName}...`);
        const notionUpdate = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              'Onboarding Status': { select: { name: 'In Progress' } },
            },
          }),
        });
        if (!notionUpdate.ok) console.error('Failed to update Notion status:', await notionUpdate.text());

        // 2. Save client directly to Supabase via service logic
        console.log(`Saving client ${clientName} to Supabase...`);
        const { client } = await saveClient({
          name: clientName,
          email,
          notion_page_id: page.id,
          status: 'In Progress',
        });

        // 3. Send onboarding email directly via service logic
        console.log(`Sending onboarding email to ${email}...`);
        await sendOnboardingEmail({
          clientId: client.id,
          clientName,
          email,
          appUrl,
        });

        triggered.push(clientName);
      } catch (err: any) {
        console.error(`Error processing page ${page.id}:`, err);
        errors.push(`Error processing page ${page.id}: ${err.message || String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      pagesChecked: pages.length,
      triggered,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Polling internal error:', error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
