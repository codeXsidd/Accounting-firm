import { NextRequest, NextResponse } from 'next/server';
import { saveClient } from '@/lib/onboarding-service';

export async function POST(req: NextRequest) {
  try {
    const { name, email, notion_page_id, status } = await req.json();

    const result = await saveClient({
      name,
      email,
      notion_page_id,
      status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Save client internal error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
