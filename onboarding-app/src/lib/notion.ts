import { Client } from '@/lib/supabase';

// Notion field name constants  
export const NOTION_FIELDS = {
  CLIENT_NAME: 'Client Name',
  EMAIL: 'Email',
  DEAL_CLOSED: 'Deal Closed',
  ONBOARDING_STATUS: 'Onboarding Status',
};

export interface NotionClient {
  pageId: string;
  clientName: string;
  email: string;
  dealClosed: boolean;
  onboardingStatus: string;
}

// Parse a Notion page into our structured format
export function parseNotionPage(page: any): NotionClient | null {
  try {
    const props = page.properties;
    const clientName =
      props[NOTION_FIELDS.CLIENT_NAME]?.title?.[0]?.plain_text || '';
    const email =
      props[NOTION_FIELDS.EMAIL]?.email ||
      props[NOTION_FIELDS.EMAIL]?.rich_text?.[0]?.plain_text ||
      '';
    const dealClosed = props[NOTION_FIELDS.DEAL_CLOSED]?.checkbox ?? false;
    const onboardingStatus =
      props[NOTION_FIELDS.ONBOARDING_STATUS]?.select?.name ||
      props[NOTION_FIELDS.ONBOARDING_STATUS]?.rich_text?.[0]?.plain_text ||
      'Not Started';

    if (!clientName || !email) return null;

    return {
      pageId: page.id,
      clientName,
      email,
      dealClosed,
      onboardingStatus,
    };
  } catch {
    return null;
  }
}

export function buildOnboardingLink(clientId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/onboarding/${clientId}`;
}
