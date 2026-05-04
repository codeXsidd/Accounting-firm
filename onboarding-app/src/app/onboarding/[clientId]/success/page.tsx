'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const { clientId } = useParams<{clientId:string}>();
  return (
    <div style={{minHeight:'100vh',background:'#06060b',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',textAlign:'center'}}>
      <div style={{width:'100%',maxWidth:520,animation:'fadeIn 0.6s ease'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.2))',border:'2px solid rgba(16,185,129,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 24px',boxShadow:'0 0 40px rgba(16,185,129,0.3)'}}>✅</div>
        <h1 style={{fontSize:30,fontWeight:800,color:'#f8fafc',marginBottom:12}}>Onboarding <span style={{background:'linear-gradient(135deg,#10b981,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Complete!</span></h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:32}}>
          Thank you for completing your onboarding. Your information has been securely saved, your documents uploaded, and your status has been updated in Notion.<br/><br/>
          Our team will review your submission and reach out within 1–2 business days.
        </p>
        <div style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:16,padding:20,marginBottom:28}}>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>What happens next</div>
          {['Your data is stored securely in Supabase','Your Notion CRM is updated to Completed','Our team reviews your submission within 24h','You receive a welcome call to get started'].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,textAlign:'left'}}>
              <span style={{width:22,height:22,borderRadius:6,background:'rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#34d399',flexShrink:0}}>{i+1}</span>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.25)',marginTop:16}}>Client ID: <code style={{color:'rgba(99,102,241,0.7)'}}>{clientId}</code></div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
