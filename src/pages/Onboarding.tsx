import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClients, updateClient, addTimelineEvent } from '../data/mockClients';
import type { Client } from '../data/mockClients';
import { ArrowLeft, ArrowRight, Check, Upload, X, ShieldCheck, User, Building2, FileText } from 'lucide-react';

const STEPS = ['Client Type', 'Basic Info', 'Business Details', 'Tax & Compliance', 'Financial Info', 'Review'];

export const Onboarding = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [phase, setPhase] = useState<1|2|3|4>(1);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd'|'bwd'>('fwd');
  const [form, setForm] = useState({ clientType: 'business', firstName: '', lastName: '', email: '', phone: '', companyName: '', industry: 'Technology', employees: '', taxId: '', filingStatus: '', revenue: '', bankName: '' });
  const [files, setFiles] = useState<{name: string; size: number; type: string; doc: string}[]>([]);
  const [dragging, setDragging] = useState(false);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [sig, setSig] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = getClients().find(x => x.id === clientId);
    if (c) { setClient(c); addTimelineEvent(c.id, { label: 'Onboarding form opened', type: 'form' }); }
  }, [clientId]);

  if (!client) return <div style={{minHeight:'100vh',background:'#020617',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>Loading…</div>;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const getSteps = () => form.clientType === 'individual' ? [0, 1, 3, 4, 5] : [0, 1, 2, 3, 4, 5];
  const getVisibleSteps = () => getSteps();
  const curIdx = getVisibleSteps().indexOf(step);
  const totalSteps = getVisibleSteps().length;

  const goNext = () => {
    const steps = getVisibleSteps();
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) { setDir('fwd'); setStep(steps[idx + 1]); }
    else { setPhase(2); addTimelineEvent(client.id, { label: 'Intake form completed', type: 'form' }); }
  };

  const goBack = () => {
    const steps = getVisibleSteps();
    const idx = steps.indexOf(step);
    if (idx > 0) { setDir('bwd'); setStep(steps[idx - 1]); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const docTypes = ['ID Proof', 'Tax Return', 'Bank Statement'];
    Array.from(e.dataTransfer.files).forEach(f => {
      setFiles(prev => [...prev, { name: f.name, size: f.size, type: f.type, doc: docTypes[prev.length % 3] }]);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const docTypes = ['ID Proof', 'Tax Return', 'Bank Statement'];
    if (e.target.files) Array.from(e.target.files).forEach(f => {
      setFiles(prev => [...prev, { name: f.name, size: f.size, type: f.type, doc: docTypes[prev.length % 3] }]);
    });
  };

  const handleSubmit = () => {
    const updated = updateClient(client.id, { status: 'Completed', kickoffDate: new Date().toISOString(), onboardingData: { ...form, docsCount: files.length } });
    addTimelineEvent(client.id, { label: 'Onboarding completed & submitted', type: 'completed' });
    setPhase(4);
  };

  const inp = (label: string, k: string, placeholder: string = '', type: string = 'text') => (
    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
      <label style={{fontSize:'0.8125rem',fontWeight:600,color:'#94a3b8'}}>{label}</label>
      <input className="form-input" type={type} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder} />
    </div>
  );

  const sel = (label: string, k: string, opts: string[]) => (
    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
      <label style={{fontSize:'0.8125rem',fontWeight:600,color:'#94a3b8'}}>{label}</label>
      <select className="form-input" value={(form as any)[k]} onChange={e=>set(k,e.target.value)} style={{cursor:'pointer'}}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div className="animate-fade-in-up">
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>What type of client are you?</h2>
          <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>This helps us personalize your onboarding experience.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            {[{k:'individual',icon:<User size={32}/>,label:'Individual',desc:'Personal tax & accounting'},{k:'business',icon:<Building2 size={32}/>,label:'Business',desc:'Corporate accounting & compliance'}].map(t=>(
              <button key={t.k} onClick={()=>set('clientType',t.k)} className={`type-card ${form.clientType===t.k?'selected':''}`} style={{background:'none',border:'none',fontFamily:'Inter,sans-serif',textAlign:'center'}}>
                <div style={{color:form.clientType===t.k?'#818cf8':'#475569',transition:'color 0.2s'}}>{t.icon}</div>
                <div style={{fontWeight:700,fontSize:'1.0625rem',color:form.clientType===t.k?'#c7d2fe':'#94a3b8'}}>{t.label}</div>
                <div style={{fontSize:'0.8125rem',color:'#475569'}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      );
      case 1: return (
        <div className="animate-fade-in-up">
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>Basic Information</h2>
          <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>Tell us a bit about yourself.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
            {inp('First Name','firstName','John')}
            {inp('Last Name','lastName','Doe')}
            <div style={{gridColumn:'1/-1'}}>{inp('Email Address','email','john@example.com','email')}</div>
            <div style={{gridColumn:'1/-1'}}>{inp('Phone Number','phone','+1 (555) 000-0000','tel')}</div>
          </div>
        </div>
      );
      case 2: return (
        <div className="animate-fade-in-up">
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>Business Details</h2>
          <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>Tell us about your company.</p>
          <div style={{display:'grid',gap:'1.25rem'}}>
            {inp('Company Name','companyName','Acme Corp')}
            {sel('Industry','industry',['Technology','Retail','Healthcare','Finance','Manufacturing','Real Estate','Other'])}
            {sel('Number of Employees','employees',['1-10','11-50','51-200','201-500','500+'])}
          </div>
        </div>
      );
      case 3: return (
        <div className="animate-fade-in-up">
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>Tax & Compliance</h2>
          <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>Required for regulatory compliance.</p>
          <div style={{display:'grid',gap:'1.25rem'}}>
            {inp('Tax ID / EIN / SSN','taxId','XX-XXXXXXX')}
            {sel('Filing Status','filingStatus',['Single','Married Filing Jointly','Married Filing Separately','Head of Household','LLC','S-Corp','C-Corp'])}
          </div>
        </div>
      );
      case 4: return (
        <div className="animate-fade-in-up">
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>Financial Information</h2>
          <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>Help us understand your financial profile.</p>
          <div style={{display:'grid',gap:'1.25rem'}}>
            {sel('Estimated Annual Revenue','revenue',['Under $50k','$50k – $150k','$150k – $500k','$500k – $1M','Over $1M'])}
            {inp('Primary Bank Name','bankName','Chase, Wells Fargo…')}
          </div>
        </div>
      );
      case 5: return (
        <div className="animate-fade-in-up">
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>Review Your Information</h2>
          <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>Please verify all details before continuing.</p>
          <div style={{background:'rgba(15,23,42,0.8)',border:'1px solid rgba(51,65,85,0.6)',borderRadius:'1rem',padding:'1.5rem',display:'grid',gap:'0.875rem'}}>
            {Object.entries(form).filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',paddingBottom:'0.625rem',borderBottom:'1px solid rgba(51,65,85,0.3)',fontSize:'0.875rem'}}>
                <span style={{color:'#64748b',textTransform:'capitalize'}}>{k.replace(/([A-Z])/g,' $1')}</span>
                <span style={{color:'#cbd5e1',fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  const pct = phase === 1 ? ((curIdx + 1) / totalSteps) * 50 : phase === 2 ? 66 : phase === 3 ? 90 : 100;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#020617 0%,#0f172a 50%,#020617 100%)',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <header style={{padding:'1.25rem 2rem',borderBottom:'1px solid rgba(51,65,85,0.5)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(15,23,42,0.8)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <div style={{width:'2rem',height:'2rem',borderRadius:'0.5rem',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ShieldCheck size={14} color="white"/>
          </div>
          <span style={{fontWeight:800,fontSize:'1rem',color:'#f8fafc'}}>ClientFlow Onboarding</span>
        </div>
        <div style={{fontSize:'0.8125rem',color:'#64748b'}}>Welcome, <span style={{color:'#c7d2fe',fontWeight:600}}>{client.name}</span></div>
      </header>

      {/* Progress */}
      <div style={{height:'3px',background:'rgba(51,65,85,0.5)'}}>
        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#6366f1,#8b5cf6)',transition:'width 0.5s ease'}}/>
      </div>

      <main style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>

        {/* PHASE 1: Form */}
        {phase===1 && (
          <div className="glass-card" style={{width:'100%',maxWidth:'600px',padding:'2.5rem'}}>
            {/* Step indicators */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2.5rem'}}>
              {getVisibleSteps().map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap:'0.375rem'}}>
                  <div style={{width:'1.75rem',height:'1.75rem',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,transition:'all 0.3s',
                    background: i<curIdx?'#6366f1':i===curIdx?'#6366f1':'rgba(51,65,85,0.5)',
                    color: i<=curIdx?'white':'#475569',
                    boxShadow: i===curIdx?'0 0 12px rgba(99,102,241,0.5)':'none'}}>
                    {i<curIdx?<Check size={12}/>:i+1}
                  </div>
                  {i<getVisibleSteps().length-1 && <div style={{width:'2rem',height:'2px',background:i<curIdx?'#6366f1':'rgba(51,65,85,0.5)',transition:'background 0.3s'}}/>}
                </div>
              ))}
            </div>
            <div style={{minHeight:'320px'}}>{renderStep()}</div>
            <div style={{marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(51,65,85,0.5)',display:'flex',justifyContent:'space-between'}}>
              <button onClick={goBack} disabled={curIdx===0} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem 1.5rem',borderRadius:'0.75rem',border:'1px solid rgba(51,65,85,0.6)',background:'transparent',color:curIdx===0?'#334155':'#94a3b8',cursor:curIdx===0?'not-allowed':'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:'0.875rem'}}>
                <ArrowLeft size={16}/> Back
              </button>
              <button onClick={goNext} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem 1.75rem',borderRadius:'0.75rem',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:'0.875rem',boxShadow:'0 4px 16px rgba(99,102,241,0.3)'}}>
                {step===5?'Continue to Documents':'Continue'} <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: Documents */}
        {phase===2 && (
          <div className="glass-card animate-scale-in" style={{width:'100%',maxWidth:'600px',padding:'2.5rem'}}>
            <div style={{textAlign:'center',marginBottom:'2rem'}}>
              <div style={{width:'4rem',height:'4rem',borderRadius:'1.25rem',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',color:'#818cf8'}}>
                <Upload size={28}/>
              </div>
              <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',margin:'0 0 0.5rem'}}>Document Upload</h2>
              <p style={{color:'#64748b',fontSize:'0.9375rem',margin:0}}>Upload your required documents to proceed.</p>
            </div>

            {/* Required docs checklist */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.625rem',marginBottom:'1.5rem'}}>
              {['ID Proof','Tax Return','Bank Statement'].map(doc=>{
                const uploaded = files.some(f=>f.doc===doc);
                return (
                  <div key={doc} style={{padding:'0.75rem',borderRadius:'0.75rem',border:`1px solid ${uploaded?'rgba(16,185,129,0.3)':'rgba(51,65,85,0.5)'}`,background:uploaded?'rgba(16,185,129,0.08)':'rgba(15,23,42,0.5)',textAlign:'center'}}>
                    <div style={{fontSize:'1.25rem',marginBottom:'0.25rem'}}>{uploaded?'✅':'📄'}</div>
                    <div style={{fontSize:'0.6875rem',fontWeight:600,color:uploaded?'#34d399':'#64748b'}}>{doc}</div>
                  </div>
                );
              })}
            </div>

            {/* Drop zone */}
            <div ref={dropRef} className={dragging?'drop-zone-active':''} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
              style={{border:'2px dashed rgba(51,65,85,0.8)',borderRadius:'1rem',padding:'2.5rem',textAlign:'center',position:'relative',transition:'all 0.2s',cursor:'pointer',background:dragging?'rgba(99,102,241,0.05)':'transparent'}}
              onClick={()=>document.getElementById('fileInput')?.click()}>
              <input id="fileInput" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInput} style={{display:'none'}}/>
              <FileText size={36} style={{color:'#475569',margin:'0 auto 0.75rem',display:'block'}}/>
              <p style={{fontWeight:600,color:'#94a3b8',margin:'0 0 0.25rem'}}>Drag & drop files here</p>
              <p style={{fontSize:'0.8125rem',color:'#475569',margin:0}}>PDF, JPG, PNG supported</p>
            </div>

            {files.length>0 && (
              <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {files.map((f,i)=>(
                  <div key={i} className="file-item">
                    <div style={{display:'flex',alignItems:'center',gap:'0.625rem',minWidth:0}}>
                      <span style={{fontSize:'1rem'}}>✅</span>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:'0.8125rem',color:'#e2e8f0',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                        <div style={{fontSize:'0.6875rem',color:'#6366f1'}}>{f.doc}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <span style={{fontSize:'0.75rem',color:'#475569'}}>{(f.size/1024).toFixed(0)}KB</span>
                      <button onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',padding:0}}><X size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(51,65,85,0.5)',display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setPhase(1)} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem 1.5rem',borderRadius:'0.75rem',border:'1px solid rgba(51,65,85,0.6)',background:'transparent',color:'#94a3b8',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:'0.875rem'}}>
                <ArrowLeft size={16}/> Back
              </button>
              <button onClick={()=>{if(files.length>0){addTimelineEvent(client.id,{label:`${files.length} document(s) uploaded`,type:'docs'});setPhase(3);}}} disabled={files.length===0}
                style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem 1.75rem',borderRadius:'0.75rem',border:'none',background:files.length===0?'rgba(51,65,85,0.4)':'linear-gradient(135deg,#6366f1,#8b5cf6)',color:files.length===0?'#475569':'white',cursor:files.length===0?'not-allowed':'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:'0.875rem',boxShadow:files.length>0?'0 4px 16px rgba(99,102,241,0.3)':'none'}}>
                Continue to Final Step <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: Consent */}
        {phase===3 && (
          <div className="glass-card animate-scale-in" style={{width:'100%',maxWidth:'600px',padding:'2.5rem'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#f8fafc',marginBottom:'0.5rem'}}>Consent & Digital Signature</h2>
            <p style={{color:'#64748b',marginBottom:'2rem',fontSize:'0.9375rem'}}>Please review and agree to proceed.</p>

            <div style={{background:'rgba(15,23,42,0.8)',border:'1px solid rgba(51,65,85,0.6)',borderRadius:'1rem',padding:'1.25rem',fontSize:'0.875rem',color:'#94a3b8',lineHeight:1.7,marginBottom:'1.5rem'}}>
              By submitting this form, I certify that all information provided is accurate and complete. I authorize the accounting firm to process my financial data for the purpose of providing accounting services.
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.75rem'}}>
              {[
                {s:agree1,set:setAgree1,label:'I agree to the Terms of Service and Privacy Policy'},
                {s:agree2,set:setAgree2,label:'I consent to electronic communications and digital document delivery'},
              ].map((item,i)=>(
                <label key={i} style={{display:'flex',alignItems:'flex-start',gap:'0.75rem',cursor:'pointer'}}>
                  <input type="checkbox" className="custom-checkbox" checked={item.s} onChange={e=>item.set(e.target.checked)} style={{marginTop:'2px'}}/>
                  <span style={{fontSize:'0.875rem',color:'#94a3b8',lineHeight:1.5}}>{item.label}</span>
                </label>
              ))}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'2rem'}}>
              <label style={{fontSize:'0.8125rem',fontWeight:600,color:'#94a3b8'}}>Digital Signature — Type your full legal name</label>
              <input className="form-input" value={sig} onChange={e=>setSig(e.target.value)} placeholder="Your full name" style={{fontStyle:'italic',fontSize:'1.125rem',fontFamily:'Georgia,serif'}}/>
            </div>

            <div style={{paddingTop:'1.5rem',borderTop:'1px solid rgba(51,65,85,0.5)',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <button onClick={handleSubmit} disabled={!agree1||!agree2||!sig.trim()}
                style={{width:'100%',padding:'1rem',borderRadius:'0.875rem',border:'none',background:(!agree1||!agree2||!sig.trim())?'rgba(51,65,85,0.4)':'linear-gradient(135deg,#6366f1,#8b5cf6)',color:(!agree1||!agree2||!sig.trim())?'#475569':'white',cursor:(!agree1||!agree2||!sig.trim())?'not-allowed':'pointer',fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:'1rem',boxShadow:agree1&&agree2&&sig?'0 8px 24px rgba(99,102,241,0.35)':'none',transition:'all 0.2s'}}>
                🚀 Submit & Begin Onboarding
              </button>
              <button onClick={()=>setPhase(2)} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'0.8125rem',fontFamily:'Inter,sans-serif'}}>← Back to documents</button>
            </div>
          </div>
        )}

        {/* PHASE 4: Success */}
        {phase===4 && (
          <div className="animate-scale-in" style={{textAlign:'center',maxWidth:'480px'}}>
            <div style={{width:'6rem',height:'6rem',borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 2rem',boxShadow:'0 0 40px rgba(16,185,129,0.5)'}}>
              <Check size={48} color="white" strokeWidth={2.5}/>
            </div>
            <h1 style={{fontSize:'2.25rem',fontWeight:800,color:'#f8fafc',marginBottom:'1rem',letterSpacing:'-0.025em'}}>Onboarding Complete! 🎉</h1>
            <p style={{fontSize:'1.125rem',color:'#64748b',marginBottom:'2.5rem',lineHeight:1.6}}>Your information has been submitted successfully. Our team will review your file and be in touch within 1–2 business days.</p>
            <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'1rem',padding:'1.25rem',marginBottom:'2rem',textAlign:'left'}}>
              <div style={{fontWeight:700,color:'#34d399',marginBottom:'0.75rem',fontSize:'0.875rem'}}>✅ What happens next:</div>
              {['Your account is being set up','Our accountant will review your documents','You\'ll receive a kickoff call invite','First meeting scheduled within 3 days'].map((item,i)=>(
                <div key={i} style={{fontSize:'0.875rem',color:'#94a3b8',padding:'0.375rem 0',display:'flex',gap:'0.625rem',alignItems:'center'}}>
                  <span style={{color:'#6366f1',fontWeight:700}}>{i+1}.</span>{item}
                </div>
              ))}
            </div>
            <button onClick={()=>navigate('/')} style={{padding:'0.875rem 2.5rem',borderRadius:'0.875rem',border:'1px solid rgba(51,65,85,0.6)',background:'rgba(30,41,59,0.8)',color:'#f1f5f9',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:'0.9375rem'}}>
              ← Return to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
