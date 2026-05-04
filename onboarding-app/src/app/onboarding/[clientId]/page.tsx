'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STEPS = ['Client Type','Basic Info','Business Details','Tax & Compliance','Financial Info'];

type FormData = {
  clientType: string;
  basicInfo: Record<string,string>;
  businessInfo: Record<string,string>;
  taxInfo: Record<string,string>;
  financialInfo: Record<string,string>;
};

export default function OnboardingPage() {
  const { clientId } = useParams<{clientId:string}>();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<{name:string;email:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    clientType:'',
    basicInfo:{firstName:'',lastName:'',phone:'',address:'',city:'',state:'',zip:''},
    businessInfo:{businessName:'',businessType:'',ein:'',yearEstablished:'',employees:'',annualRevenue:''},
    taxInfo:{filingStatus:'',prevTaxPreparer:'',taxIssues:'no',statesFiled:''},
    financialInfo:{bankName:'',accountType:'',hasInvestments:'no',hasMortgage:'no',monthlyExpenses:''},
  });

  useEffect(() => {
    fetch(`/api/clients`).then(r=>r.json()).then((list:Array<{id:string;name:string;email:string}>)=>{
      const c = list.find((x)=>x.id===clientId);
      if(c) setClient({name:c.name,email:c.email});
    });
  },[clientId]);

  const progress = ((step)/(STEPS.length))*100;

  const update = (section: keyof FormData, key: string, value: string) => {
    if(section==='clientType') { setForm(f=>({...f,clientType:value})); return; }
    setForm(f=>({...f,[section]:{...(f[section] as Record<string,string>),[key]:value}}));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/save-onboarding',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          clientId, clientType:form.clientType,
          basicInfo:form.basicInfo, businessInfo:form.businessInfo,
          taxInfo:form.taxInfo, financialInfo:form.financialInfo,
          signature:'',
        }),
      });
      if(res.ok) router.push(`/onboarding/${clientId}/documents`);
    } finally { setSaving(false); }
  };

  const inp = (label:string, section:keyof FormData, key:string, type='text', opts?:string[]) => (
    <div key={key} style={{marginBottom:16}}>
      <label style={{display:'block',fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.55)',marginBottom:6}}>{label}</label>
      {opts ? (
        <select value={(form[section] as Record<string,string>)[key]||''} onChange={e=>update(section,key,e.target.value)} style={inputStyle}>
          <option value=''>Select…</option>
          {opts.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={(form[section] as Record<string,string>)[key]||''} onChange={e=>update(section,key,e.target.value)} placeholder={label} style={inputStyle} />
      )}
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#06060b',display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 20px'}}>
      {/* Header */}
      <div style={{width:'100%',maxWidth:680,marginBottom:32}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>⚡</div>
          <span style={{fontWeight:700,fontSize:16,color:'#f8fafc'}}>AccountFlow Pro</span>
        </div>
        {client && <div style={{marginBottom:20}}>
          <h1 style={{fontSize:26,fontWeight:800,color:'#f8fafc',marginBottom:4}}>Welcome, <span style={{background:'linear-gradient(135deg,#6366f1,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{client.name}</span>!</h1>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:14}}>Complete your onboarding in just a few steps.</p>
        </div>}
        {/* Progress */}
        <div style={{marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.6)'}}>Step {step+1} of {STEPS.length}: {STEPS[step]}</span>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.35)'}}>{Math.round(progress)}%</span>
        </div>
        <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:100,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:'linear-gradient(90deg,#6366f1,#a78bfa)',borderRadius:100,transition:'width 0.4s ease'}} />
        </div>
        <div style={{display:'flex',gap:6,marginTop:12}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{flex:1,height:3,borderRadius:100,background:i<=step?'linear-gradient(90deg,#6366f1,#a78bfa)':'rgba(255,255,255,0.08)',transition:'background 0.3s'}} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{width:'100%',maxWidth:680,background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:24,padding:36,animation:'fadeIn 0.4s ease'}}>
        <h2 style={{fontSize:20,fontWeight:700,color:'#f8fafc',marginBottom:24}}>{STEPS[step]}</h2>

        {step===0 && (
          <div style={{display:'grid',gap:12}}>
            {[
              {val:'individual',icon:'👤',title:'Individual',desc:'Personal tax and financial services'},
              {val:'business',icon:'🏢',title:'Business / LLC / Corp',desc:'Business accounting and tax planning'},
              {val:'nonprofit',icon:'🤝',title:'Non-Profit Organization',desc:'Non-profit compliance and reporting'},
            ].map(opt=>(
              <div key={opt.val} onClick={()=>update('clientType','clientType',opt.val)} style={{padding:20,border:`2px solid ${form.clientType===opt.val?'#6366f1':'rgba(255,255,255,0.08)'}`,borderRadius:16,background:form.clientType===opt.val?'rgba(99,102,241,0.1)':'rgba(255,255,255,0.03)',cursor:'pointer',display:'flex',alignItems:'center',gap:14,transition:'all 0.2s'}}>
                <span style={{fontSize:28}}>{opt.icon}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:15,color:'#f8fafc'}}>{opt.title}</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginTop:2}}>{opt.desc}</div>
                </div>
                {form.clientType===opt.val && <div style={{marginLeft:'auto',width:20,height:20,borderRadius:'50%',background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'white'}}>✓</div>}
              </div>
            ))}
          </div>
        )}

        {step===1 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
            {inp('First Name','basicInfo','firstName')}
            {inp('Last Name','basicInfo','lastName')}
            <div style={{gridColumn:'1/-1'}}>{inp('Phone','basicInfo','phone','tel')}</div>
            <div style={{gridColumn:'1/-1'}}>{inp('Address','basicInfo','address')}</div>
            {inp('City','basicInfo','city')}
            {inp('State','basicInfo','state')}
            {inp('ZIP Code','basicInfo','zip')}
          </div>
        )}

        {step===2 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
            <div style={{gridColumn:'1/-1'}}>{inp('Business Name','businessInfo','businessName')}</div>
            {inp('Business Type','businessInfo','businessType',undefined,['LLC','S-Corp','C-Corp','Sole Proprietor','Partnership'])}
            {inp('EIN (Tax ID)','businessInfo','ein')}
            {inp('Year Established','businessInfo','yearEstablished')}
            {inp('Number of Employees','businessInfo','employees',undefined,['1-5','6-20','21-50','50+'])}
            {inp('Annual Revenue','businessInfo','annualRevenue',undefined,['Under $100K','$100K-$500K','$500K-$1M','$1M+'])}
          </div>
        )}

        {step===3 && (
          <div>
            {inp('Filing Status','taxInfo','filingStatus',undefined,['Single','Married Filing Jointly','Married Filing Separately','Head of Household'])}
            {inp('Previous Tax Preparer','taxInfo','prevTaxPreparer',undefined,['Self','CPA','H&R Block','TurboTax','Other'])}
            {inp('Any outstanding tax issues?','taxInfo','taxIssues',undefined,['no','yes - IRS notices','yes - back taxes','yes - audit'])}
            {inp('States you file in','taxInfo','statesFiled')}
          </div>
        )}

        {step===4 && (
          <div>
            {inp('Primary Bank','financialInfo','bankName',undefined,['Chase','Bank of America','Wells Fargo','Citibank','Other'])}
            {inp('Account Type','financialInfo','accountType',undefined,['Checking','Savings','Business Checking','Multiple'])}
            {inp('Do you have investments?','financialInfo','hasInvestments',undefined,['no','yes - stocks/ETFs','yes - real estate','yes - both'])}
            {inp('Do you have a mortgage?','financialInfo','hasMortgage',undefined,['no','yes - primary home','yes - rental property','yes - multiple'])}
            {inp('Estimated Monthly Business Expenses','financialInfo','monthlyExpenses',undefined,['Under $1K','$1K-$5K','$5K-$15K','$15K+'])}
          </div>
        )}

        {/* Navigation */}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:32,paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          <button onClick={()=>setStep(s=>s-1)} disabled={step===0} style={{padding:'12px 24px',borderRadius:12,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',fontSize:14,fontWeight:600,cursor:step===0?'not-allowed':'pointer',opacity:step===0?0.4:1}}>← Back</button>
          {step<STEPS.length-1 ? (
            <button onClick={()=>setStep(s=>s+1)} style={{padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'white',fontSize:14,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 20px rgba(99,102,241,0.35)'}}>Continue →</button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} style={{padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'white',fontSize:14,fontWeight:600,cursor:'pointer',opacity:saving?0.7:1}}>
              {saving ? 'Saving…' : '✓ Save & Continue to Documents'}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} input,select{color-scheme:dark}`}</style>
    </div>
  );
}

const inputStyle:React.CSSProperties = {
  width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:12,padding:'12px 16px',fontSize:14,color:'#f8fafc',outline:'none',fontFamily:'Inter,sans-serif',
};
