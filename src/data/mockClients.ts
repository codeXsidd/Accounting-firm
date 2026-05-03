export type ClientStatus = 'Not Started' | 'In Progress' | 'Awaiting Documents' | 'Completed';

export interface TimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  type: 'email' | 'form' | 'docs' | 'completed' | 'created' | 'reminder';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  dealClosed: boolean;
  contractSigned: boolean;
  invoiceSent: boolean;
  kickoffDate: string | null;
  onboardingData?: any;
  timeline: TimelineEvent[];
  createdAt: string;
}

const STORAGE_KEY = 'clientflow_clients_v3';

export const initialClients: Client[] = [
  {
    id: 'c-001',
    name: 'Acme Corp',
    email: 'contact@acmecorp.com',
    status: 'Not Started',
    dealClosed: false,
    contractSigned: false,
    invoiceSent: false,
    kickoffDate: null,
    timeline: [
      {
        id: 'ev-001',
        label: 'Lead created in CRM',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'created',
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c-002',
    name: 'TechStart Solutions',
    email: 'hello@techstart.io',
    status: 'Not Started',
    dealClosed: false,
    contractSigned: false,
    invoiceSent: false,
    kickoffDate: null,
    timeline: [
      {
        id: 'ev-002',
        label: 'Lead created in CRM',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'created',
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c-003',
    name: 'Bright Horizons LLC',
    email: 'admin@brighthorizons.com',
    status: 'Not Started',
    dealClosed: false,
    contractSigned: false,
    invoiceSent: false,
    kickoffDate: null,
    timeline: [
      {
        id: 'ev-003',
        label: 'Lead created in CRM',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'created',
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getClients = (): Client[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClients));
      return initialClients;
    }
    return JSON.parse(data);
  } catch {
    return initialClients;
  }
};

export const saveClients = (clients: Client[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
};

export const updateClient = (id: string, updates: Partial<Client>) => {
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates };
    saveClients(clients);
  }
  return clients;
};

export const addTimelineEvent = (
  clientId: string,
  event: Omit<TimelineEvent, 'id' | 'timestamp'>
) => {
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === clientId);
  if (index !== -1) {
    const newEvent: TimelineEvent = {
      ...event,
      id: `ev-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    clients[index].timeline = [...(clients[index].timeline || []), newEvent];
    saveClients(clients);
    return clients;
  }
  return clients;
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const resetClients = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClients));
  return initialClients;
};
