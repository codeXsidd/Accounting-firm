import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    const fileType = formData.get('fileType') as string;

    if (!file || !clientId || !fileType) {
      return NextResponse.json(
        { error: 'file, clientId, and fileType are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${fileType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    const storagePath = `${clientId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('onboarding-docs')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('onboarding-docs')
      .getPublicUrl(storagePath);

    // Save document record
    const { data: docRecord, error: dbError } = await supabase
      .from('documents')
      .insert({
        client_id: clientId,
        file_type: fileType,
        file_name: file.name,
        file_url: urlData.publicUrl,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      document: docRecord,
      fileUrl: urlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
