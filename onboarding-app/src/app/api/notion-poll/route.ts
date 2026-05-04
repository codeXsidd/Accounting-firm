import { NextResponse } from 'next/server';

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

    for (const page of pages) {
      try {
        const props = page.properties;
        
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

        // 2. Upsert client in Supabase
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        console.log(`Saving client to Supabase via ${appUrl}/api/save-client...`);
        const saveRes = await fetch(
          `${appUrl}/api/save-client`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: clientName,
              email,
              notion_page_id: page.id,
              status: 'In Progress',
            }),
          }
        );

        if (!saveRes.ok) {
          const saveErr = await saveRes.text();
          console.error('Save Client Error:', saveErr);
          errors.push(`Failed to save client ${clientName}: ${saveErr}`);
          continue;
        }

        const { client } = await saveRes.json();

        // 3. Send onboarding email
        console.log(`Sending email to ${email} via ${appUrl}/api/send-email...`);
        const emailRes = await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: client.id,
            clientName,
            email,
          }),
        });
        if (!emailRes.ok) console.error('Send Email Error:', await emailRes.text());

        triggered.push(clientName);
      } catch (err) {
        console.error(`Error processing page ${page.id}:`, err);
        errors.push(`Error processing page ${page.id}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      pagesChecked: pages.length,
      triggered,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Polling internal error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
