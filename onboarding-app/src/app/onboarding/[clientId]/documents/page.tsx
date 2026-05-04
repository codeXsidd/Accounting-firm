'use client';
import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

const DOC_TYPES = ['ID Proof','Tax Return','Bank Statements'];

interface UploadedFile { type: string; name: string; url: string; }

function FileZone({ docType, onUploaded, clientId }: { docType:string; onUploaded:(f:UploadedFile)=>void; clientId:string; }) {
  const [status, setStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (accepted: File[]) => {
    if(!accepted[0]) return;
    const file = accepted[0];
    setFileName(file.name);
    setStatus('uploading');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('clientId', clientId);
      fd.append('fileType', docType);
      const res = await fetch('/api/upload', { method:'POST', body:fd });
      if(res.ok) {
        const data = await res.json();
        onUploaded({ type:docType, name:file.name, url:data.fileUrl });
        setStatus('done');
      } else { setStatus('error'); }
    } catch { setStatus('error'); }
  }, [clientId, docType, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles:1 });

  return (
    <div {...getRootProps()} style={{ border:`2px dashed ${status==='done'?'rgba(16,185,129,0.5)':isDragActive?'rgba(99,102,241,0.7)':'rgba(255,255,255,0.12)'}`, borderRadius:16, padding:24, cursor:'pointer', textAlign:'center', background:status==='done'?'rgba(16,185,129,0.06)':isDragActive?'rgba(99,102,241,0.08)':'rgba(255,255,255,0.03)', transition:'all 0.3s', marginBottom:12 }}>
      <input {...getInputProps()} />
      <div style={{fontSize:28,marginBottom:8}}>{status==='done'?'✅':status==='uploading'?'⏳':'📄'}</div>
      <div style={{fontWeight:600,fontSize:14,color:'#f8fafc',marginBottom:4}}>{docType}</div>
      {status==='idle' && <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{isDragActive?'Drop here…':'Drag & drop or click to browse'}</div>}
      {status==='uploading' && <div style={{fontSize:12,color:'#fbbf24'}}>Uploading {fileName}…</div>}
      {status==='done' && <div style={{fontSize:12,color:'#34d399'}}>{fileName} — uploaded ✓</div>}
      {status==='error' && <div style={{fontSize:12,color:'#f87171'}}>Upload failed — try again</div>}
    </div>
  );
}

export default function DocumentsPage() {
  const { clientId } = useParams<{clientId:string}>();
  const router = useRouter();
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [signature, setSignature] = useState('');
  const [agree, setAgree] = useState({terms:false,accuracy:false,consent:false});
  const [submitting, setSubmitting] = useState(false);

  const handleUploaded = (f: UploadedFile) => setUploaded(prev=>[...prev.filter(x=>x.type!==f.type),f]);

  const canSubmit = Object.values(agree).every(Boolean) && signature.trim().length>2;

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      // Patch onboarding with signature
      await fetch('/api/save-onboarding',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ clientId, clientType:'', basicInfo:{}, businessInfo:{}, taxInfo:{}, financialInfo:{}, signature }),
      });
      router.push(`/onboarding/${clientId}/success`);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#06060b',display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 20px'}}>
      <div style={{width:'100%',maxWidth:640}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>⚡</div>
          <span style={{fontWeight:700,fontSize:16,color:'#f8fafc'}}>AccountFlow Pro</span>
        </div>

        <h1 style={{fontSize:24,fontWeight:800,color:'#f8fafc',marginBottom:6}}>Upload <span style={{background:'linear-gradient(135deg,#6366f1,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Documents</span></h1>
        <p style={{color:'rgba(255,255,255,0.45)',fontSize:14,marginBottom:28}}>Please upload the required documents. All files are stored securely.</p>

        {/* Progress indicator */}
        <div style={{display:'flex',gap:6,marginBottom:32}}>
          {['Form Complete','Upload Docs','Signature','Done'].map((s,i)=>(
            <div key={s} style={{flex:1,textAlign:'center'}}>
              <div style={{height:3,borderRadius:100,background:i<=1?'linear-gradient(90deg,#6366f1,#a78bfa)':'rgba(255,255,255,0.08)',marginBottom:6}} />
              <span style={{fontSize:11,color:i<=1?'#818cf8':'rgba(255,255,255,0.3)'}}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:24,padding:32,marginBottom:20}}>
          <h2 style={{fontSize:16,fontWeight:700,color:'#f8fafc',marginBottom:20}}>📁 Required Documents</h2>
          {DOC_TYPES.map(dt=>(
            <FileZone key={dt} docType={dt} clientId={clientId} onUploaded={handleUploaded} />
          ))}
          <div style={{marginTop:8,padding:'12px 16px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:10,fontSize:12,color:'rgba(255,255,255,0.5)'}}>
            ✅ {uploaded.length} of {DOC_TYPES.length} documents uploaded · Files stored in Supabase Storage
          </div>
        </div>

        {/* Agreements & Signature */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:24,padding:32}}>
          <h2 style={{fontSize:16,fontWeight:700,color:'#f8fafc',marginBottom:20}}>✍️ Agreement & Signature</h2>
          {[
            {key:'terms',label:'I agree to the Terms of Service and Privacy Policy'},
            {key:'accuracy',label:'I certify that all information provided is accurate and complete'},
            {key:'consent',label:'I consent to electronic communication and document storage'},
          ].map(item=>(
            <label key={item.key} style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:16,cursor:'pointer'}}>
              <div onClick={()=>setAgree(a=>({...a,[item.key]:!a[item.key as keyof typeof a]}))} style={{width:20,height:20,borderRadius:6,border:`2px solid ${agree[item.key as keyof typeof agree]?'#6366f1':'rgba(255,255,255,0.2)'}`,background:agree[item.key as keyof typeof agree]?'#6366f1':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,cursor:'pointer',transition:'all 0.2s'}}>
                {agree[item.key as keyof typeof agree] && <span style={{fontSize:11,color:'white',fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{item.label}</span>
            </label>
          ))}
          <div style={{marginTop:8}}>
            <label style={{display:'block',fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.55)',marginBottom:8}}>Electronic Signature (type your full name)</label>
            <input value={signature} onChange={e=>setSignature(e.target.value)} placeholder="Your full name" style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'14px 16px',fontSize:16,color:'#f8fafc',outline:'none',fontFamily:'cursive',letterSpacing:1}} />
          </div>
          <button onClick={handleFinalSubmit} disabled={!canSubmit||submitting} style={{marginTop:24,width:'100%',padding:'16px',borderRadius:14,background:canSubmit?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.06)',border:'none',color:canSubmit?'white':'rgba(255,255,255,0.3)',fontSize:15,fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',transition:'all 0.3s',boxShadow:canSubmit?'0 8px 32px rgba(99,102,241,0.4)':'none'}}>
            {submitting ? '⏳ Submitting…' : '🚀 Complete Onboarding'}
          </button>
        </div>
      </div>
    </div>
  );
}
