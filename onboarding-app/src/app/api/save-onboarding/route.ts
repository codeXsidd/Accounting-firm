import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const {
      clientId,
      clientType,
      basicInfo,
      businessInfo,
      taxInfo,
      financialInfo,
      signature,
    } = await req.json();

    const supabase = createServiceClient();

    // 1. Insert onboarding data
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_data')
      .insert({
        client_id: clientId,
        client_type: clientType,
        basic_info: basicInfo || {},
        business_info: businessInfo || {},
        tax_info: taxInfo || {},
        financial_info: financialInfo || {},
        signature: signature || '',
      })
      .select()
      .single();

    if (onboardingError) throw onboardingError;

    // 2. Update client status to Completed
    const { error: clientError } = await supabase
      .from('clients')
      .update({ status: 'Completed' })
      .eq('id', clientId);

    if (clientError) throw clientError;

    // 3. Update Notion page to Completed
    const { data: clientData } = await supabase
      .from('clients')
      .select('notion_page_id')
      .eq('id', clientId)
      .single();

    if (clientData?.notion_page_id && process.env.NOTION_API_KEY) {
      await fetch(
        `https://api.notion.com/v1/pages/${clientData.notion_page_id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              'Onboarding Status': { select: { name: 'Completed' } },
            },
          }),
        }
      );
    }

    return NextResponse.json({
      success: true,
      onboardingId: onboardingData.id,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const supabase = createServiceClient();

    if (clientId) {
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
