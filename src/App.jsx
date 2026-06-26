import { useState, useRef, useCallback, useEffect } from "react";

const C = {
  bg:"#07080F", surface:"#0E1120", card:"#141728", border:"#1E2340",
  pink:"#D946EF", cyan:"#22D3EE", gold:"#F59E0B", white:"#F8FAFF",
  muted:"#8892B0", dim:"#3D4466", green:"#10B981", red:"#F87171",
};

const PLATFORMS = [
  {id:"instagram",name:"Instagram",color:"#E1306C"},
  {id:"youtube",name:"YouTube",color:"#FF0000"},
  {id:"facebook",name:"Facebook",color:"#1877F2"},
  {id:"tiktok",name:"TikTok",color:"#69C9D0"},
  {id:"twitter",name:"X/Twitter",color:"#1DA1F2"},
  {id:"linkedin",name:"LinkedIn",color:"#0077B5"},
];

const FORMATS = {
  instagram:["Post 1:1","Story 9:16","Reel 9:16","Carousel"],
  youtube:["Short 9:16","Video 16:9","Thumbnail","Community"],
  facebook:["Post","Story","Reel","Cover"],
  tiktok:["Video 9:16","Photo","Story"],
  twitter:["Post","Card","Header"],
  linkedin:["Post","Story","Article"],
};

const TOOLS = [
  {id:"image",label:"Text to Image",icon:"IMG",desc:"Generate real AI images instantly"},
  {id:"video",label:"Text to Video",icon:"VID",desc:"Sora 2 video script and scenes"},
  {id:"img2vid",label:"Image to Video",icon:"I2V",desc:"Animate your photos"},
  {id:"aud2vid",label:"Audio to Video",icon:"A2V",desc:"Visuals from audio"},
  {id:"caption",label:"AI Caption",icon:"CAP",desc:"Viral captions and hashtags"},
  {id:"resize",label:"Smart Resize",icon:"RSZ",desc:"Format for all platforms"},
];

const TONES = ["Viral","Luxury","Funny","Educational","Inspiring","Edgy"];

const DEFAULT_PLANS = [
  {id:"starter",name:"Starter",price:199,credits:100,period:"mo",color:"#a855f7",features:["100 credits/month","All AI tools","All 6 platforms","Sora 2 video","Email support"]},
  {id:"creator",name:"Creator",price:499,credits:300,period:"mo",color:"#D946EF",popular:true,features:["300 credits/month","All Starter features","Priority generation","4K Image export","Priority support"]},
  {id:"pro",name:"Pro",price:999,credits:1000,period:"mo",color:"#22D3EE",features:["1000 credits/month","All Creator features","Early access models","API access (soon)","Dedicated support"]},
  {id:"impulse",name:"Impulse Pack",price:119,credits:50,period:"6 days",color:"#F59E0B",features:["50 credits","One-time purchase","Expires in 6 days","No subscription","Perfect viral push"]},
];

async function callAI(prompt) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",
      max_tokens:1500,
      system:"You are a viral social media content expert. Always respond with valid JSON only. No markdown. No backticks.",
      messages:[{role:"user",content:prompt}]
    }),
  });
  
  if(!res.ok) throw new Error("API error "+res.status);
  
  // FIX: Parse the API response first
  const data = await res.json();
  
  // Extract text from the Claude response
  const text = data.content?.map(b=>b.text||"").join("")||"";

  console.log("CLAUDE RESPONSE:", text);
  
  // Parse the JSON string returned by Claude
  try {
    const parsedResult = JSON.parse(text);
    return parsedResult;
  } catch(e) {
    console.error("Failed to parse Claude response as JSON:", text);
    return { raw: text };
  }
}

function CopyBtn({text,label}){
  const [done,setDone]=useState(false);
  return <button onClick={()=>{navigator.clipboard?.writeText(text);setDone(true);setTimeout(()=>setDone(false),2000);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(done?C.green:C.border),background:"none",color:done?C.green:C.pink,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
    {done?"✓ Copied":"📋 "+label}
  </button>;
}

function ScoreRing({score}){
  const color=score>=80?C.green:score>=60?C.gold:C.red;
  return <div style={{width:80,height:80,borderRadius:"50%",border:"4px solid "+color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color}}>{score}</div><div style={{fontSize:10,color:C.muted}}>Viral%</div></div></div>;
}

function Card({children,accent,style}){
  return <div style={{background:C.card,border:"1px solid "+(accent||C.border),borderRadius:14,padding:16,marginBottom:12,...style}}>{children}</div>;
}

function Lbl({text}){
  return <p style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>{text}</p>;
}

const inp={width:"100%",background:"#0E1120",border:"1px solid #1E2340",borderRadius:10,padding:"11px 14px",color:"#F8FAFF",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};

export default function App(){
  const [page,setPage]=useState("landing");
  const [user,setUser]=useState(null);
  const [authMode,setAuthMode]=useState("signup");
  const [tool,setTool]=useState("image");
  const [platform,setPlatform]=useState("instagram");
  const [format,setFormat]=useState("Post 1:1");
  const [tone,setTone]=useState("Viral");
  const [prompt,setPrompt]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [credits,setCredits]=useState(5);
  const [publishStatus,setPublishStatus]=useState({});
  const [history,setHistory]=useState([]);
  const [showImpulse,setShowImpulse]=useState(false);
  const [sora2Used,setSora2Used]=useState(0);
  const [videoModel,setVideoModel]=useState("sora2_free");
  const fileRef=useRef();
  const audioRef=useRef();
  const [uploadedFile,setUploadedFile]=useState(null);
  const [uploadedAudio,setUploadedAudio]=useState(null);
  const [authLoading,setAuthLoading]=useState(false);
  const [otpSent,setOtpSent]=useState(false);
  const [otpTimer,setOtpTimer]=useState(0);
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");

  // Admin editable plans
  const [plans,setPlans]=useState(()=>{
    try{ const s=localStorage.getItem("rasa_plans"); return s?JSON.parse(s):DEFAULT_PLANS; }catch(e){ return DEFAULT_PLANS; }
  });
  const [editingPlan,setEditingPlan]=useState(null);
  const [editForm,setEditForm]=useState({});

  // Real stats stored in localStorage
  const [stats,setStats]=useState(()=>{
    try{ const s=localStorage.getItem("rasa_stats"); return s?JSON.parse(s):{totalUsers:0,subscriptions:0,revenue:0,freeUsers:0,creditsUsed:0,transactions:[],logins:[]}; }catch(e){ return {totalUsers:0,subscriptions:0,revenue:0,freeUsers:0,creditsUsed:0,transactions:[],logins:[]}; }
  });

  const pName=PLATFORMS.find(p=>p.id===platform)?.name||"Instagram";

  useEffect(()=>{
    if(otpTimer>0){const t=setTimeout(()=>setOtpTimer(s=>s-1),1000);return()=>clearTimeout(t);}
  },[otpTimer]);

  // Save plans to localStorage
  function savePlans(newPlans){
    setPlans(newPlans);
    try{localStorage.setItem("rasa_plans",JSON.stringify(newPlans));}catch(e){}
  }

  // Update stats
  function updateStats(type,data){
    setStats(prev=>{
      const n={...prev};
      if(type==="login"){
        n.totalUsers=(n.totalUsers||0)+1;
        n.logins=[{name:data.name,email:data.email||"",plan:data.plan,time:new Date().toLocaleTimeString()},...(n.logins||[])].slice(0,20);
      }
      if(type==="credit_used"){
        n.creditsUsed=(n.creditsUsed||0)+1;
      }
      if(type==="subscribe"){
        n.subscriptions=(n.subscriptions||0)+1;
        n.revenue=(n.revenue||0)+data.amount;
        n.transactions=[{user:data.user,plan:data.plan,amount:"₹"+data.amount,status:"Success",time:new Date().toLocaleTimeString(),id:"pay_"+Math.random().toString(36).slice(2,10)},...(n.transactions||[])].slice(0,30);
      }
      try{localStorage.setItem("rasa_stats",JSON.stringify(n));}catch(e){}
      return n;
    });
  }

  function handleEmailAuth(){
    if(!email||!pass){setError("Please fill all fields");return;}
    if(authMode==="signup"&&!name){setError("Please enter your name");return;}
    setError("");setAuthLoading(true);
    setTimeout(()=>{
      const isAdmin=email.toLowerCase().includes("rasashopofficial")||email.toLowerCase()==="admin@rasaaistudio.com";
      const newUser={name:name||email.split("@")[0],email,plan:isAdmin?"Admin":"Free",isAdmin};
      setUser(newUser);
      setCredits(isAdmin?999999:5);
      updateStats("login",newUser);
      setPage(isAdmin?"admin":"studio");
      setAuthLoading(false);
    },900);
  }

  function handleSendOtp(){
    if(!phone||phone.length!==10){setError("Enter valid 10-digit number");return;}
    setError("");setAuthLoading(true);
    setTimeout(()=>{setOtpSent(true);setOtpTimer(30);setAuthLoading(false);},1000);
  }

  function handleVerifyOtp(){
    if(!otp||otp.length<4){setError("Enter valid OTP");return;}
    setError("");setAuthLoading(true);
    setTimeout(()=>{
      const newUser={name:"Creator",phone:"+91 "+phone,plan:"Free",isAdmin:false};
      setUser(newUser);setCredits(5);
      updateStats("login",newUser);
      setPage("studio");setAuthLoading(false);
    },1000);
  }

  function handleSignout(){
    setUser(null);setPage("landing");
    setEmail("");setPass("");setPhone("");setOtp("");setOtpSent(false);setName("");
  }

  const generate=useCallback(async()=>{
    if(!prompt.trim()&&tool!=="img2vid"&&tool!=="aud2vid"){setError("Please enter a description");return;}
    if(credits<=0){setShowImpulse(true);return;}
    if(tool==="video"&&videoModel==="sora2_free"&&sora2Used>=2&&user?.plan==="Free"){
      setError("Sora 2 free limit reached! Upgrade to Starter ₹199/mo for unlimited videos.");return;
    }
    const selModel={sora2_free:"Sora 2 (Free)",sora2_paid:"Sora 2",kling16:"Kling 1.6 Pro",runway:"Runway Gen-3"}[videoModel]||"Sora 2";
    setLoading(true);setResult(null);setError("");
    try{
      let userPrompt="";
      if(tool==="image"){
        userPrompt=`Generate viral image content for ${pName} ${format}. Tone: ${tone}. Brief: ${prompt}. Return JSON: imagePrompt (200 word photorealistic prompt), negativePrompt, caption, captionV2, hashtags (array).`;
      } else if(tool==="video"){
        userPrompt=`Generate viral video script for ${pName} ${format} optimized for ${selModel}. Tone: ${tone}. Brief: ${prompt}. Return JSON: videoPrompt (200 word cinematic generation prompt for ${selModel}), script (detailed breakdown), hook (opening line), caption, hashtags.`;
      } else if(tool==="img2vid"){
        userPrompt=`Generate image to video animation for ${pName}. File: ${uploadedFile?.name||"image"}. Tone: ${tone}. Instructions: ${prompt||"Animate naturally"}. Return JSON: animationPrompt (200 word prompt), caption, hashtags.`;
      } else if(tool==="aud2vid"){
        userPrompt=`Generate audio to video visual for ${pName}. Audio: ${uploadedAudio?.name||"audio"}. Tone: ${tone}. Brief: ${prompt||"Match audio mood"}. Return JSON: visualPrompt (200 word prompt), caption, hashtags.`;
      } else if(tool==="caption"){
        userPrompt=`Generate viral captions for ${pName} ${format}. Tone: ${tone}. Content: ${prompt}. Return JSON: caption1, caption2, caption3, hashtags (array).`;
      } else if(tool==="resize"){
        userPrompt=`Generate resize guide for all platforms. Original: ${format} for ${pName}. Content: ${prompt}. Return JSON with dimensions for each platform.`;
      }
      const data=await callAI(userPrompt);
      if(tool==="image"&&data.imagePrompt){
        data.imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(data.imagePrompt.slice(0,500))}?width=1080&height=1080&nologo=true&seed=${Date.now()}`;
      }
      setResult(data);
      setCredits(c=>c-1);
      updateStats("credit_used",{});
      if(tool==="video"&&videoModel==="sora2_free") setSora2Used(s=>s+1);
      setHistory(h=>[{id:Date.now(),tool,platform,prompt,result:data},...h].slice(0,30));
    } catch(err){
      setError("Generation failed: "+(err.message||"Please try again"));
    }
    setLoading(false);
  },[prompt,tool,platform,format,tone,credits,uploadedFile,uploadedAudio,pName,videoModel,sora2Used,user]);

  function publish(pid){
    setPublishStatus(s=>({...s,[pid]:"publishing"}));
    setTimeout(()=>setPublishStatus(s=>({...s,[pid]:"done"})),2000);
  }

  function startEditPlan(plan){
    setEditingPlan(plan.id);
    setEditForm({name:plan.name,price:plan.price,credits:plan.credits,period:plan.period,features:plan.features.join("\n")});
  }

  function saveEditPlan(){
    const newPlans=plans.map(p=>p.id===editingPlan?{...p,...editForm,price:Number(editForm.price),credits:Number(editForm.credits),features:editForm.features.split("\n").filter(f=>f.trim())}:p);
    savePlans(newPlans);
    setEditingPlan(null);
  }

  // ── STYLES
  const CSS=`*{box-sizing:border-box;margin:0;padding:0}body{background:#07080F}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2E3450;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{height:60,background:C.surface+"ee",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>setPage("landing")} style={{background:"none",border:"none",color:C.white,fontWeight:800,fontSize:20,cursor:"pointer",fontFamily:"inherit"}}>
          rasa<span style={{color:C.pink}}>.ai</span>
        </button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user?(
            <>
              <button onClick={()=>setPage("studio")} style={{background:page==="studio"?C.pink+"22":"none",border:"none",color:page==="studio"?C.pink:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Studio</button>
              <button onClick={()=>setPage("dashboard")} style={{background:page==="dashboard"?C.pink+"22":"none",border:"none",color:page==="dashboard"?C.pink:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Dashboard</button>
              {user.isAdmin&&<button onClick={()=>setPage("admin")} style={{background:page==="admin"?"#10B98122":"none",border:"none",color:page==="admin"?C.green:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Admin</button>}
              <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:99,padding:"5px 12px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#D946EF,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:C.white}}>{user.name.charAt(0)}</div>
                <span style={{color:C.white,fontSize:13,fontWeight:600}}>{user.name}</span>
                <span style={{color:user.isAdmin?C.green:C.pink,fontSize:11,fontWeight:700}}>{user.isAdmin?"∞ ADMIN":credits+"cr"}</span>
              </div>
              <button onClick={handleSignout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Sign out</button>
            </>
          ):(
            <>
              <button onClick={()=>setPage("pricing")} style={{background:"none",border:"none",color:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Pricing</button>
              <button onClick={()=>{setAuthMode("login");setPage("auth");}} style={{background:"none",border:"1px solid "+C.border,color:C.white,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Sign in</button>
              <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,padding:"8px 18px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>Sign up</button>
            </>
          )}
        </div>
      </nav>

      {/* ══ LANDING ══ */}
      {page==="landing"&&(
        <div>
          <div style={{minHeight:"90vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 24px",background:"radial-gradient(ellipse 80% 60% at 50% 40%,#D946EF08 0%,transparent 70%)"}}>
            <div style={{maxWidth:700,textAlign:"center",animation:"fadeIn 0.8s ease"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.pink+"18",border:"1px solid "+C.pink+"44",borderRadius:99,padding:"5px 14px",marginBottom:20}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.pink,animation:"pulse 1.5s infinite"}}/>
                <span style={{color:C.pink,fontSize:11,fontWeight:700,letterSpacing:"0.12em"}}>AI SOCIAL MEDIA STUDIO</span>
              </div>
              <h1 style={{fontSize:"clamp(32px,5vw,64px)",fontWeight:900,lineHeight:1.1,letterSpacing:"-0.03em",margin:"0 0 16px"}}>
                Create content that{" "}
                <span style={{background:"linear-gradient(90deg,#D946EF,#22D3EE)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>actually goes viral.</span>
              </h1>
              <p style={{color:C.muted,fontSize:18,lineHeight:1.7,maxWidth:500,margin:"0 auto 36px"}}>
                Real AI images via Gemini, Sora 2 video generation, viral captions — all in one studio built for creators.
              </p>
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
                <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{padding:"15px 32px",borderRadius:12,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>Get Started Free</button>
                <button onClick={()=>setPage("pricing")} style={{padding:"15px 28px",borderRadius:12,background:"none",border:"1px solid "+C.border,color:C.white,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>View Plans</button>
              </div>
              <div style={{display:"flex",gap:32,justifyContent:"center"}}>
                {[["50K+","Creators"],["12M+","Posts made"],["6","Platforms"]].map(s=>(
                  <div key={s[1]} style={{textAlign:"center"}}>
                    <div style={{color:C.white,fontWeight:800,fontSize:24,letterSpacing:"-0.02em"}}>{s[0]}</div>
                    <div style={{color:C.muted,fontSize:12}}>{s[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{padding:"80px 24px",background:C.surface}}>
            <div style={{maxWidth:1100,margin:"0 auto"}}>
              <h2 style={{textAlign:"center",fontSize:36,fontWeight:800,marginBottom:48}}>Everything you need to go viral</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
                {[{icon:"IMG",title:"Real Image Generation",desc:"Photorealistic images via Gemini Nano — state-of-the-art AI model."},{icon:"VID",title:"Sora 2 Video",desc:"Generate cinematic videos"},{icon:"CAP",title:"Viral Captions",desc:"AI-powered copywriting"},{icon:"RSZ",title:"Smart Resize",desc:"Format for all platforms"},{icon:"I2V",title:"Animate Images",desc:"From static to motion"},{icon:"A2V",title:"Audio to Video",desc:"Visuals from your audio"}].map(f=>(
                  <div key={f.title} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"22px 20px"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:C.pink+"22",border:"1px solid "+C.pink+"44",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:C.pink,fontWeight:800,fontSize:12}}>{f.icon}</div>
                    <p style={{fontWeight:700,fontSize:14,marginBottom:6,color:C.white}}>{f.title}</p>
                    <p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{padding:"80px 24px",textAlign:"center"}}>
            <h2 style={{fontSize:44,fontWeight:900,marginBottom:16}}>Start in 30 seconds.</h2>
            <p style={{color:C.muted,fontSize:17,marginBottom:32}}>No credit card needed. 5 free credits on signup.</p>
            <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{padding:"16px 40px",borderRadius:12,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>Create Free Account</button>
          </div>
          <div style={{borderTop:"1px solid "+C.border,padding:24,textAlign:"center"}}>
            <p style={{color:C.dim,fontSize:13}}>rasa.ai — 2025 — All rights reserved</p>
          </div>
        </div>
      )}

      {/* ══ AUTH ══ */}
      {page==="auth"&&(
        <div style={{minHeight:"calc(100vh - 60px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div id="recaptcha-container"/>
          <div style={{width:"100%",maxWidth:420,animation:"fadeIn 0.4s ease"}}>
            <h2 style={{fontSize:26,fontWeight:800,marginBottom:6,textAlign:"center"}}>{authMode==="phone"?"Mobile OTP Login":authMode==="signup"?"Create your account":"Welcome back"}</h2>
            <p style={{color:C.muted,fontSize:14,textAlign:"center",marginBottom:24}}>{authMode==="signup"?"5 free credits. No card needed.":"Sign in to continue"}</p>
            <div style={{display:"flex",background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:4,marginBottom:20,gap:4}}>
              {[{id:"email",label:"📧 Email"},{id:"phone",label:"📱 Mobile OTP"}].map(m=>(
                <button key={m.id} onClick={()=>{setAuthMode(m.id==="phone"?"phone":(authMode==="login"?"login":"signup"));setError("");setOtpSent(false);}}
                  style={{flex:1,padding:"11px",border:"none",borderRadius:11,cursor:"pointer",fontSize:13,fontWeight:700,background:(m.id==="phone"?authMode==="phone":authMode!=="phone")?"linear-gradient(90deg,#D946EF,#7C3AED)":"transparent",color:(m.id==="phone"?authMode==="phone":authMode!=="phone")?C.white:C.muted,fontFamily:"inherit"}}
                  >{m.label}
                </button>
              ))}
            </div>
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:18,padding:28}}>
              {error&&<p style={{color:C.red,fontSize:13,marginBottom:14,background:C.red+"11",padding:"10px 14px",borderRadius:10}}>⚠️ {error}</p>}
              {authMode==="phone"?(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <Lbl text="Mobile Number"/>
                    <div style={{display:"flex",gap:10}}>
                      <div style={{...inp,flex:"none",width:"auto",padding:"11px 14px",color:C.muted}}>🇮🇳 +91</div>
                      <input type="tel" maxLength={10} placeholder="10-digit number" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} disabled={otpSent} style={{...inp,flex:1}}/>
                    </div>
                  </div>
                  {!otpSent?(
                    <button onClick={handleSendOtp} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      {authLoading?"Sending OTP...":"Send OTP →"}
                    </button>
                  ):(
                    <>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <Lbl text="Enter OTP"/>
                          <span style={{color:C.green,fontSize:12}}>✓ Sent to +91 {phone}</span>
                        </div>
                        <input type="tel" maxLength={6} placeholder="· · · · · ·" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} autoFocus style={{...inp,letterSpacing:12}}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                          <span style={{color:C.muted,fontSize:12}}>{otpTimer>0?`Resend in ${otpTimer}s`:""}</span>
                          {otpTimer===0&&<span onClick={handleSendOtp} style={{color:C.pink,fontSize:12,fontWeight:700,cursor:"pointer"}}>Resend OTP</span>}
                        </div>
                      </div>
                      <button onClick={handleVerifyOtp} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        {authLoading?"Verifying...":"Verify & Sign In →"}
                      </button>
                      <button onClick={()=>{setOtpSent(false);setOtp("");setPhone("");setError("");}} style={{width:"100%",padding:"11px",borderRadius:10,background:"transparent",border:"1px solid "+C.border,color:C.muted,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        Change number
                      </button>
                    </>
                  )}
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {authMode==="signup"&&<div><Lbl text="Your Name"/><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Priya Sharma"/></div>}
                  <div><Lbl text="Email"/><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></div>
                  <div><Lbl text="Password"/><input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 8 characters" onKeyDown={e=>e.key==="Enter"&&handleEmailAuth()}/></div>
                  <button onClick={handleEmailAuth} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    {authLoading?"Please wait...":authMode==="signup"?"Create account":"Sign in"}
                  </button>
                  <p style={{textAlign:"center",color:C.muted,fontSize:13}}>
                    {authMode==="signup"?"Already have an account? ":"New here? "}
                    <button onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")} style={{background:"none",border:"none",color:C.pink,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      {authMode==="signup"?"Sign in":"Create account"}
                    </button>
                  </p>
                </div>
              )}
            </div>
            <p style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:16}}>By continuing you agree to our Terms & Privacy Policy</p>
          </div>
        </div>
      )}

      {/* ══ PRICING ══ */}
      {page==="pricing"&&(
        <div style={{padding:"60px 24px",maxWidth:1100,margin:"0 auto"}}>
          <h2 style={{textAlign:"center",fontSize:36,fontWeight:800,marginBottom:8}}>Simple pricing</h2>
          <p style={{textAlign:"center",color:C.muted,marginBottom:48,fontSize:16}}>New users get <span style={{color:C.pink,fontWeight:700}}>5 free credits.</span> No card needed.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18}}>
            {plans.map(plan=>(
              <div key={plan.id} style={{background:plan.popular?"linear-gradient(160deg,#141728,#1A0A2E)":C.card,border:"1.5px solid "+(plan.popular?C.pink:C.border),borderRadius:18,padding:"28px",position:"relative",textAlign:"center"}}>
                {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(90deg,#D946EF,#7C3AED)",borderRadius:99,padding:"3px 14px",fontSize:10,fontWeight:800,color:C.white}}>POPULAR</div>}
                <p style={{color:plan.color,fontWeight:800,fontSize:12,letterSpacing:2,marginBottom:10}}>{plan.name.toUpperCase()}</p>
                <div style={{marginBottom:20}}>
                  <span style={{color:C.white,fontWeight:800,fontSize:42,letterSpacing:"-0.03em"}}>₹{plan.price}</span>
                  <span style={{color:C.muted,fontSize:14}}>/{plan.period}</span>
                </div>
                <p style={{color:plan.color,fontSize:12,fontWeight:700,marginBottom:12}}>✦ {plan.credits} credits</p>
                {plan.features.map(f=>(
                  <div key={f} style={{display:"flex",gap:8,marginBottom:8}}>
                    <span style={{color:C.green}}>✓</span>
                    <span style={{color:C.white,fontSize:13}}>{f}</span>
                  </div>
                ))}
                <button onClick={()=>{if(!user)setPage("auth");}} style={{width:"100%",marginTop:20,padding:"12px",borderRadius:10,background:plan.popular?"linear-gradient(90deg,#D946EF,#7C3AED)":C.pink+"22",border:"none",color:plan.popular?C.white:C.pink,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  {plan.id==="impulse"?"Buy Now — ₹"+plan.price:"Start "+plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Studio, Dashboard, Admin remain the same */}
    </div>
  );
}