import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, email, notion_page_id, status } = await req.json();

    const supabase = createServiceClient();

    // Check if client already exists
    const { data: existing, error } = await supabase
      .from('clients')
      .select('*')
      .eq('notion_page_id', notion_page_id)
      .maybeSingle(); // Use maybeSingle to avoid 406/PGRST116 error when no rows found

    if (error) {
      console.error('Supabase existing check error:', error);
      throw error;
    }

    if (existing) {
      // Update status
      const { data, error: updateError } = await supabase
        .from('clients')
        .update({ status, name, email })
        .eq('notion_page_id', notion_page_id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      return NextResponse.json({ client: data, action: 'updated' });
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
    return NextResponse.json({ client: data, action: 'created' });
  } catch (error: any) {
    console.error('Save client internal error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
