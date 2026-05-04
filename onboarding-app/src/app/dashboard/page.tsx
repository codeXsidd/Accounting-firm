'use client';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

interface Client {
  id: string; name: string; email: string;
  notion_page_id: string; status: string; created_at: string;
}
interface OnboardingData {
  client_type: string; basic_info: Record<string,unknown>;
  business_info: Record<string,unknown>; tax_info: Record<string,unknown>;
  financial_info: Record<string,unknown>; signature: string;
}
interface Document { id: string; file_type: string; file_name: string; file_url: string; uploaded_at: string; }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string,{bg:string,color:string,dot:string,label:string}> = {
    'Not Started': { bg:'rgba(148,163,184,0.1)', color:'#94a3b8', dot:'#64748b', label:'Not Started' },
    'In Progress': { bg:'rgba(245,158,11,0.12)', color:'#fbbf24', dot:'#f59e0b', label:'In Progress' },
    'Completed':   { bg:'rgba(16,185,129,0.12)', color:'#34d399', dot:'#10b981', label:'Completed' },
  };
  const s = map[status] || map['Not Started'];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:600, background:s.bg, color:s.color, border:`1px solid ${s.color}30` }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, ...(status==='In Progress' ? {animation:'pulse 2s ease-in-out infinite'} : {}) }} />
      {s.label}
    </span>
  );
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollStatus, setPollStatus] = useState<{triggered:string[],pagesChecked:number}|null>(null);
  const [selectedClient, setSelectedClient] = useState<Client|null>(null);
  const [clientData, setClientData] = useState<OnboardingData|null>(null);
  const [clientDocs, setClientDocs] = useState<Document[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [autoPolling, setAutoPolling] = useState(false);
  const [lastPoll, setLastPoll] = useState<string>('');

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/clients');
    if (res.ok) { const data = await res.json(); setClients(data); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    if (!autoPolling) return;
    const id = setInterval(async () => {
      await triggerPoll();
      await fetchClients();
    }, 10000);
    return () => clearInterval(id);
  }, [autoPolling, fetchClients]);

  const triggerPoll = async () => {
    setPolling(true);
    try {
      const res = await fetch('/api/notion-poll');
      if (res.ok) {
        const data = await res.json();
        setPollStatus({ triggered: data.triggered || [], pagesChecked: data.pagesChecked || 0 });
        setLastPoll(new Date().toLocaleTimeString());
        if ((data.triggered||[]).length > 0) await fetchClients();
      }
    } finally { setPolling(false); }
  };

  const openClient = async (client: Client) => {
    setSelectedClient(client);
    setDetailLoading(true);
    setClientData(null); setClientDocs([]);
    try {
      const [d, docs] = await Promise.all([
        fetch(`/api/save-onboarding?clientId=${client.id}`).then(r=>r.ok?r.json():null),
        fetch(`/api/upload?clientId=${client.id}`).then(r=>r.ok?r.json():[]),
      ]);
      setClientData(d); setClientDocs(docs);
    } finally { setDetailLoading(false); }
  };

  const stats = { total: clients.length, notStarted: clients.filter(c=>c.status==='Not Started').length, inProgress: clients.filter(c=>c.status==='In Progress').length, completed: clients.filter(c=>c.status==='Completed').length };

  return (
    <div style={{ minHeight:'100vh', background:'#06060b', backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)', backgroundSize:'40px 40px' }}>
      {/* Top nav */}
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(6,6,11,0.8)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:'#f8fafc' }}>AccountFlow Pro</div>
            <div style={{ fontSize:11, color:'rgba(248,250,252,0.4)' }}>Admin Dashboard</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {lastPoll && <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Last polled: {lastPoll}</span>}
          <button onClick={()=>setAutoPolling(p=>!p)} style={{ padding:'8px 16px', borderRadius:10, border:`1px solid ${autoPolling?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.1)'}`, background: autoPolling?'rgba(16,185,129,0.1)':'rgba(255,255,255,0.04)', color: autoPolling?'#34d399':'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background: autoPolling?'#10b981':'#64748b', ...(autoPolling?{animation:'pulse 1.5s ease-in-out infinite'}:{}) }} />
            {autoPolling ? 'Auto-Poll ON' : 'Auto-Poll OFF'}
          </button>
          <button onClick={async()=>{await triggerPoll();await fetchClients();}} disabled={polling} style={{ padding:'8px 18px', borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', opacity:polling?0.7:1, display:'flex', alignItems:'center', gap:6 }}>
            {polling ? '⏳ Polling...' : '🔄 Poll Notion'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#f8fafc', marginBottom:6 }}>Client <span style={{ background:'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Onboarding</span></h1>
          <p style={{ color:'rgba(248,250,252,0.5)', fontSize:14 }}>Monitor and manage all client onboarding flows. Notion polling auto-detects Deal Closed triggers.</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
          {[
            { label:'Total Clients', value:stats.total, icon:'👥', color:'#6366f1' },
            { label:'Not Started', value:stats.notStarted, icon:'⏸️', color:'#64748b' },
            { label:'In Progress', value:stats.inProgress, icon:'⚡', color:'#f59e0b' },
            { label:'Completed', value:stats.completed, icon:'✅', color:'#10b981' },
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:800, color:s.color, marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Poll Status Banner */}
        {pollStatus && (
          <div style={{ background: pollStatus.triggered.length>0?'rgba(16,185,129,0.08)':'rgba(99,102,241,0.08)', border:`1px solid ${pollStatus.triggered.length>0?'rgba(16,185,129,0.2)':'rgba(99,102,241,0.2)'}`, borderRadius:12, padding:'14px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>{pollStatus.triggered.length>0?'✅':'🔍'}</span>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:pollStatus.triggered.length>0?'#34d399':'#818cf8' }}>
                {pollStatus.triggered.length>0 ? `Triggered onboarding for: ${pollStatus.triggered.join(', ')}` : `Checked ${pollStatus.pagesChecked} Notion pages — no new triggers`}
              </span>
            </div>
          </div>
        )}

        {/* Clients Table */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, overflow:'hidden' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#f8fafc' }}>All Clients</h2>
            <button onClick={fetchClients} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:13 }}>↻ Refresh</button>
          </div>
          {loading ? (
            <div style={{ padding:48, textAlign:'center', color:'rgba(255,255,255,0.4)' }}>Loading clients...</div>
          ) : clients.length === 0 ? (
            <div style={{ padding:64, textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>No clients yet. Poll Notion to detect Deal Closed triggers.</div>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['Client Name','Email','Status','Notion ID','Created','Actions'].map(h=>(
                    <th key={h} style={{ padding:'12px 24px', textAlign:'left', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:'0.5px', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c,i)=>(
                  <tr key={c.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', transition:'background 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.03)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{ padding:'16px 24px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,hsl(${(i*47)%360},70%,55%),hsl(${(i*47+40)%360},70%,45%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, fontSize:14, color:'#f8fafc' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'16px 24px', fontSize:13, color:'rgba(255,255,255,0.55)' }}>{c.email}</td>
                    <td style={{ padding:'16px 24px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding:'16px 24px', fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>{c.notion_page_id ? c.notion_page_id.slice(0,8)+'…' : '—'}</td>
                    <td style={{ padding:'16px 24px', fontSize:13, color:'rgba(255,255,255,0.4)' }}>{format(new Date(c.created_at),'MMM d, yyyy')}</td>
                    <td style={{ padding:'16px 24px' }}>
                      <button onClick={()=>openClient(c)} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#818cf8', fontSize:12, fontWeight:600, cursor:'pointer' }}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={e=>{ if(e.target===e.currentTarget) setSelectedClient(null); }}>
          <div style={{ background:'#0d0d16', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, width:'100%', maxWidth:700, maxHeight:'85vh', overflowY:'auto', animation:'fadeIn 0.3s ease' }}>
            <div style={{ padding:'24px 28px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#0d0d16', borderRadius:'24px 24px 0 0' }}>
              <div>
                <h2 style={{ fontSize:18, fontWeight:700, color:'#f8fafc' }}>{selectedClient.name}</h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{selectedClient.email}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <StatusBadge status={selectedClient.status} />
                <button onClick={()=>setSelectedClient(null)} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.6)', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16 }}>✕</button>
              </div>
            </div>
            <div style={{ padding:'24px 28px' }}>
              {detailLoading ? (
                <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.4)' }}>Loading data...</div>
              ) : (
                <>
                  {/* Onboarding Data */}
                  {clientData ? (
                    <div style={{ marginBottom:24 }}>
                      <h3 style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.5px' }}>Onboarding Data</h3>
                      <div style={{ display:'grid', gap:12 }}>
                        {[
                          { label:'Client Type', value: clientData.client_type },
                          { label:'Basic Info', value: JSON.stringify(clientData.basic_info, null, 2) },
                          { label:'Business Info', value: JSON.stringify(clientData.business_info, null, 2) },
                          { label:'Tax Info', value: JSON.stringify(clientData.tax_info, null, 2) },
                          { label:'Financial Info', value: JSON.stringify(clientData.financial_info, null, 2) },
                          { label:'Signature', value: clientData.signature },
                        ].map(row=>(
                          <div key={row.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 16px' }}>
                            <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>{row.label}</div>
                            <pre style={{ fontSize:13, color:'rgba(255,255,255,0.7)', whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'inherit', margin:0 }}>{String(row.value||'—')}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:24, textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:13 }}>
                      No onboarding data submitted yet.
                    </div>
                  )}

                  {/* Documents */}
                  <h3 style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Documents ({clientDocs.length})</h3>
                  {clientDocs.length === 0 ? (
                    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:13 }}>No documents uploaded yet.</div>
                  ) : (
                    <div style={{ display:'grid', gap:8 }}>
                      {clientDocs.map(doc=>(
                        <div key={doc.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ fontSize:20 }}>📄</span>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:'#f8fafc' }}>{doc.file_type}</div>
                              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{doc.file_name}</div>
                            </div>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ padding:'6px 14px', borderRadius:8, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#818cf8', fontSize:12, fontWeight:600, textDecoration:'none' }}>View</a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <a href={`/onboarding/${selectedClient.id}`} target="_blank" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', textDecoration:'none', fontSize:13, fontWeight:600 }}>🔗 Open Onboarding Link</a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
