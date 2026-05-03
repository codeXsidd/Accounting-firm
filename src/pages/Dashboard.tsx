import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, updateClient, addTimelineEvent, resetClients, formatDate } from '../data/mockClients';
import type { Client, ClientStatus } from '../data/mockClients';
import {
  CheckCircle2, Circle, Mail, ExternalLink, ChevronRight,
  Users, TrendingUp, Clock, RefreshCw, X, Bell, Zap,
  Building2, MoreVertical, Filter
} from 'lucide-react';

const STATUS_CONFIG: Record<ClientStatus, { label: string; cls: string }> = {
  'Not Started':        { label: 'Not Started',        cls: 'status-not-started' },
  'In Progress':        { label: 'In Progress',        cls: 'status-in-progress' },
  'Awaiting Documents': { label: 'Awaiting Documents', cls: 'status-awaiting' },
  'Completed':          { label: 'Completed',          cls: 'status-completed' },
};

/* Real Brevo (Sendinblue) transactional email */
async function sendBrevoEmail(client: Client, onboardingUrl: string) {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY as string;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid #334155;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⚡ ClientFlow</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">Automated Onboarding · Accounting Firms</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f8fafc;">Welcome, ${client.name}! 👋</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
              Your account has been set up and your onboarding is ready to begin. Complete your intake form, upload your documents, and you'll be all set.
            </p>
            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td align="center" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;padding:14px 32px;">
                  <a href="${onboardingUrl}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;display:block;">
                    🚀 Start Onboarding →
                  </a>
                </td>
              </tr>
            </table>
            <!-- Steps preview -->
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">What to expect:</div>
              ${['📋 Complete your intake form (5 minutes)', '📁 Upload required documents', '✍️ Sign & submit digitally', '🎉 Your account goes live'].map((s, i) => `
              <div style="display:flex;align-items:center;padding:6px 0;font-size:13px;color:#cbd5e1;">
                <span style="color:#6366f1;font-weight:700;margin-right:10px;">${i + 1}.</span>${s}
              </div>`).join('')}
            </div>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
              If you have any questions, reply to this email and our team will be happy to help.<br>
              <strong style="color:#94a3b8;">— The ClientFlow Team</strong>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0a0f1e;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
            <p style="margin:0;font-size:12px;color:#334155;">
              This email was sent to <strong style="color:#475569;">${client.email}</strong>. If you did not expect this, please ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  console.log('📧 [Brevo API] Sending real email to', client.email);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'ClientFlow Onboarding', email: 'onboarding@clientflow.io' },
      to: [{ email: client.email, name: client.name }],
      subject: "Welcome! Let's Begin Your Onboarding 🚀",
      htmlContent: htmlBody,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('❌ [Brevo API] Error:', err);
    throw new Error(`Brevo API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ [Brevo API] Email sent! Message ID:', data.messageId);
  return data;
}

interface Toast {
  id: number;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  link?: string;
  linkLabel?: string;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const reload = useCallback(() => {
    const c = getClients();
    setClients(c);
    if (selected) setSelected(c.find((x) => x.id === selected.id) ?? null);
  }, [selected]);

  useEffect(() => { reload(); }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 12000);
  };

  const handleDealClosed = async (client: Client) => {
    if (client.dealClosed || loadingId) return;
    setLoadingId(client.id);

    const onboardingUrl = `${window.location.origin}/onboarding/${client.id}`;

    // Optimistic UI
    let updated = updateClient(client.id, { dealClosed: true });
    setClients([...updated]);
    if (selected?.id === client.id) setSelected(updated.find((c) => c.id === client.id) ?? null);

    // Simulate email
    addToast({ type: 'info', title: 'Sending Email…', message: `Triggering Brevo API for ${client.name}` });
    try {
      await sendBrevoEmail(client, onboardingUrl);
    } catch (err) {
      addToast({ type: 'warning', title: '⚠️ Email Error', message: String(err) });
    }

    // Add timeline event
    updated = addTimelineEvent(client.id, { label: 'Welcome email sent via Brevo', type: 'email' });
    setClients([...updated]);
    if (selected?.id === client.id) setSelected(updated.find((c) => c.id === client.id) ?? null);

    setLoadingId(null);
    addToast({
      type: 'success',
      title: '✅ Onboarding Email Sent!',
      message: `${client.name} — ${client.email}`,
      link: `/onboarding/${client.id}`,
      linkLabel: 'Open Onboarding Link →',
    });

    // Simulate follow-up reminder if not started in 30s
    setTimeout(() => {
      const current = getClients().find((c) => c.id === client.id);
      if (current && current.status === 'Not Started') {
        addTimelineEvent(client.id, { label: 'Automated reminder email sent', type: 'reminder' });
        addToast({ type: 'warning', title: '🔔 Reminder Sent', message: `Automated follow-up sent to ${client.name}` });
        reload();
      }
    }, 30000);
  };

  const handleReset = () => {
    const c = resetClients();
    setClients(c);
    setSelected(null);
    addToast({ type: 'info', title: 'Demo Reset', message: 'All clients reset to initial state' });
  };

  const stats = {
    total: clients.length,
    completed: clients.filter((c) => c.status === 'Completed').length,
    inProgress: clients.filter((c) => c.status === 'In Progress' || c.status === 'Awaiting Documents').length,
    notStarted: clients.filter((c) => c.status === 'Not Started').length,
  };

  const filtered = filterStatus === 'All' ? clients : clients.filter((c) => c.status === filterStatus);

  const TIMELINE_ICONS: Record<string, string> = {
    created: '🌱', email: '📧', form: '📝', docs: '📁', completed: '🎉', reminder: '🔔',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
      {/* Toasts */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-enter glass-card"
            style={{
              padding: '1rem 1.25rem',
              borderLeft: `3px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#6366f1'}`,
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f1f5f9' }}>{toast.title}</span>
              <button onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, marginLeft: '0.5rem' }}>
                <X size={14} />
              </button>
            </div>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{toast.message}</span>
            {toast.link && (
              <a href={toast.link} target="_blank" rel="noreferrer"
                style={{
                  marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.8125rem', fontWeight: 600, color: '#818cf8', textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}>
                {toast.linkLabel} <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>
              <Zap size={20} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.025em' }}>
                ClientFlow
              </h1>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Automated Onboarding · Accounting Firms</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '9999px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              <span style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 500 }}>System Active</span>
            </div>
            <button onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '0.625rem', color: '#94a3b8', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(51,65,85,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(51,65,85,0.5)'; }}>
              <RefreshCw size={14} /> Reset Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Clients', value: stats.total, icon: <Users size={18} />, color: '#6366f1' },
            { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={18} />, color: '#10b981' },
            { label: 'In Progress', value: stats.inProgress, icon: <TrendingUp size={18} />, color: '#8b5cf6' },
            { label: 'Not Started', value: stats.notStarted, icon: <Clock size={18} />, color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>
          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(51,65,85,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={18} color="#6366f1" />
                <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Clients</span>
                <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.3)' }}>
                  {clients.length}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['All', 'Not Started', 'In Progress', 'Awaiting Documents', 'Completed'].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    style={{
                      padding: '0.3125rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                      background: filterStatus === s ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: filterStatus === s ? '#818cf8' : '#64748b',
                      border: filterStatus === s ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    }}>
                    {s === 'All' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.5)' }}>
                  {['Client', 'Status', 'Deal Closed', 'Contract Signed', 'Invoice Sent', 'Kickoff Date', ''].map((h) => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(51,65,85,0.5)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, i) => {
                  const sc = STATUS_CONFIG[client.status];
                  const isLoading = loadingId === client.id;
                  return (
                    <tr key={client.id} className="table-row-hover"
                      style={{ cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid rgba(51,65,85,0.3)' : 'none', transition: 'background 0.15s', background: selected?.id === client.id ? 'rgba(99,102,241,0.06)' : 'transparent' }}
                      onClick={() => setSelected(selected?.id === client.id ? null : client)}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: `hsl(${(client.name.charCodeAt(0) * 37) % 360}, 60%, 20%)`, border: `1px solid hsl(${(client.name.charCodeAt(0) * 37) % 360}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: `hsl(${(client.name.charCodeAt(0) * 37) % 360}, 70%, 70%)`, flexShrink: 0 }}>
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9375rem' }}>{client.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={sc.cls} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleDealClosed(client); }}
                          disabled={client.dealClosed || !!loadingId}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: client.dealClosed ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', border: 'none',
                            background: client.dealClosed ? 'rgba(16,185,129,0.15)' : isLoading ? 'rgba(99,102,241,0.2)' : 'rgba(51,65,85,0.6)',
                            color: client.dealClosed ? '#34d399' : isLoading ? '#818cf8' : '#94a3b8',
                          }}>
                          {client.dealClosed ? <CheckCircle2 size={14} /> : isLoading ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> : <Circle size={14} />}
                          {client.dealClosed ? 'Closed/Won' : isLoading ? 'Sending…' : 'Mark Closed'}
                        </button>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input type="checkbox" className="custom-checkbox" checked={client.contractSigned}
                          onChange={(e) => { e.stopPropagation(); const u = updateClient(client.id, { contractSigned: e.target.checked }); setClients([...u]); }}
                          onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input type="checkbox" className="custom-checkbox" checked={client.invoiceSent}
                          onChange={(e) => { e.stopPropagation(); const u = updateClient(client.id, { invoiceSent: e.target.checked }); setClients([...u]); }}
                          onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {client.kickoffDate ? (
                          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{formatDate(client.kickoffDate)}</span>
                        ) : (
                          <input type="date" className="form-input" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', width: 'auto', borderRadius: '0.5rem' }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => { const u = updateClient(client.id, { kickoffDate: e.target.value }); setClients([...u]); }} />
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <ChevronRight size={16} color={selected?.id === client.id ? '#6366f1' : '#334155'} style={{ transition: 'color 0.2s' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="glass-card animate-slide-in-right" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 14rem)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Client Profile</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.25rem' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Avatar + Name */}
              <div style={{ textAlign: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: `hsl(${(selected.name.charCodeAt(0) * 37) % 360}, 60%, 20%)`, border: `2px solid hsl(${(selected.name.charCodeAt(0) * 37) % 360}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: `hsl(${(selected.name.charCodeAt(0) * 37) % 360}, 70%, 70%)`, margin: '0 auto 0.75rem' }}>
                  {selected.name.charAt(0)}
                </div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>{selected.name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>{selected.email}</div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className={STATUS_CONFIG[selected.status].cls} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Onboarding Link */}
              {selected.dealClosed && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Onboarding Link</div>
                  <a href={`/onboarding/${selected.id}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#818cf8', textDecoration: 'none', wordBreak: 'break-all' }}>
                    /onboarding/{selected.id} <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Submitted data */}
              {selected.onboardingData && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Submitted Data</div>
                  <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {Object.entries(selected.onboardingData)
                      .filter(([, v]) => v !== '' && v !== undefined && v !== null && typeof v !== 'object')
                      .map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{String(v)}</span>
                        </div>
                      ))}
                    {selected.onboardingData.docsCount !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: '#64748b' }}>Documents</span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>{selected.onboardingData.docsCount} uploaded ✓</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Activity Timeline</div>
                <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <div className="timeline-line"></div>
                  {(selected.timeline || []).map((ev, i) => (
                    <div key={ev.id} style={{ position: 'relative', paddingBottom: i < selected.timeline.length - 1 ? '1.25rem' : 0 }}>
                      <div style={{ position: 'absolute', left: '-1.25rem', top: '0.125rem', width: '1rem', height: '1rem', borderRadius: '50%', background: '#0f172a', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem' }}>
                        {TIMELINE_ICONS[ev.type] || '•'}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 500 }}>{ev.label}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '0.125rem' }}>
                        {new Date(ev.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action button */}
              {selected.dealClosed && selected.status !== 'Completed' && (
                <a href={`/onboarding/${selected.id}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '0.75rem', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
                  <Mail size={16} /> Open Onboarding Form
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
