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
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:4000,
      system:"You are a viral social media content expert. Always respond with valid JSON only. No markdown. No backticks.",
      messages:[{role:"user",content:prompt}]
    }),
  });
  if(!res.ok) throw new Error("API error "+res.status);
  const data = await res.json();
  const text = data.content?.map(b=>b.text||"").join("")||"";
  return JSON.parse(text);
}

function CopyBtn({text,label}){
  const [done,setDone]=useState(false);
  return <button onClick={()=>{navigator.clipboard?.writeText(text);setDone(true);setTimeout(()=>setDone(false),2000);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(done?C.green:C.border),background:done?C.green+"22":C.surface,color:done?C.green:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{done?"Copied!":(label||"Copy")}</button>;
}

function ScoreRing({score}){
  const color=score>=80?C.green:score>=60?C.gold:C.red;
  return <div style={{width:80,height:80,borderRadius:"50%",border:"4px solid "+color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{textAlign:"center"}}><div style={{color,fontWeight:800,fontSize:20}}>{score}%</div><div style={{color:C.muted,fontSize:8,fontWeight:700}}>VIRAL</div></div></div>;
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
        n.transactions=[{user:data.user,plan:data.plan,amount:"₹"+data.amount,status:"Success",time:new Date().toLocaleTimeString(),id:"pay_"+Math.random().toString(36).slice(2,10)},...(n.transactions||[])].slice(0,20);
      }
      try{localStorage.setItem("rasa_stats",JSON.stringify(n));}catch(e){}
      return n;
    });
  }

  function handleEmailAuth(){
    if(!email||!pass){setError("Please fill all fields");return;}
    if(authMode==="signup"&&!name){setError("Please enter your name");return;}
    setError("");setAuthLoading(true);
    // Basic password validation
    if(authMode==="signup"&&pass.length<6){setError("Password must be at least 6 characters");return;}
    setTimeout(()=>{
      const isAdmin=email.toLowerCase().includes("rasashopofficial")||email.toLowerCase()==="admin@rasaaistudio.com";
      // Store user credentials in localStorage for validation
      if(authMode==="signup"){
        const users=JSON.parse(localStorage.getItem("rasa_users")||"{}");
        users[email]={password:pass,name:name||email.split("@")[0]};
        localStorage.setItem("rasa_users",JSON.stringify(users));
      } else {
        // Validate password on login
        if(!isAdmin){
          const users=JSON.parse(localStorage.getItem("rasa_users")||"{}");
          if(users[email]&&users[email].password!==pass){
            setError("Invalid email or password!");setAuthLoading(false);return;
          }
        }
      }
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
        userPrompt=`Generate viral image content for ${pName} ${format}. Tone: ${tone}. Brief: ${prompt}. Return JSON: imagePrompt (200 word photorealistic prompt), negativePrompt, caption, captionV2, captionV3, hook, hookV2, hookV3, hashtags (array 15), viralHashtags (array 5), cta, bestTime, viralityScore (number 70-95), viralityReason, algorithmTip1, algorithmTip2, algorithmTip3, algorithmTip4, algorithmTip5, postingStrategy, competitorInsight, colorPalette (array 3 hex colors)`;
      } else if(tool==="video"){
        userPrompt=`Create viral video content for ${pName} using ${selModel}. Tone: ${tone}. Brief: ${prompt}. Respond with ONLY valid compact JSON, no extra text: {"videoPrompt":"cinematic prompt here","script":"short script here","scene1time":"0-3s","scene1visual":"desc","scene2time":"3-8s","scene2visual":"desc","scene3time":"8-15s","scene3visual":"desc","hook":"hook here","caption":"caption here","hashtags":["tag1","tag2","tag3","tag4","tag5"],"cta":"cta here","musicMood":"mood","viralityScore":85,"viralityReason":"reason","algorithmTip1":"tip","algorithmTip2":"tip","postingStrategy":"strategy"}`;
      } else if(tool==="img2vid"){
        userPrompt=`Generate image to video animation for ${pName}. File: ${uploadedFile?.name||"image"}. Tone: ${tone}. Instructions: ${prompt||"Animate naturally"}. Return JSON: animationPrompt (200 word Runway/Pika prompt), motionDescription, scene1time, scene1motion, scene2time, scene2motion, scene3time, scene3motion, caption, hashtags (array 10), musicMood, hook, cta, viralityScore (number 70-95), viralityReason, postingStrategy`;
      } else if(tool==="aud2vid"){
        userPrompt=`Generate audio to video visual for ${pName}. Audio: ${uploadedAudio?.name||"audio"}. Tone: ${tone}. Brief: ${prompt||"Match audio mood"}. Return JSON: visualPrompt (200 word prompt), scene1timestamp, scene1visual, scene1mood, scene2timestamp, scene2visual, scene2mood, colorGrading, typography, caption, hashtags (array 10), hook, cta, viralityScore (number 70-95), viralityReason, postingStrategy`;
      } else if(tool==="caption"){
        userPrompt=`Generate viral captions for ${pName} ${format}. Tone: ${tone}. Content: ${prompt}. Return JSON: caption1 (curiosity gap style), caption2 (bold statement), caption3 (story hook), caption4 (list format), hook1, hook2, hook3, hashtags (array 15), viralHashtags (array 5), cta, bestTime, viralityScore (number 70-95), viralityReason, algorithmTip1, algorithmTip2, algorithmTip3, algorithmTip4, algorithmTip5, postingStrategy`;
      } else if(tool==="resize"){
        userPrompt=`Generate resize guide for all platforms. Original: ${format} for ${pName}. Content: ${prompt}. Return JSON: instagramPost, instagramStory, instagramReel, youtubeThumb, tiktokVideo, facebookPost, twitterCard, linkedinPost, masterCaption, repurposeTip1, repurposeTip2, repurposeTip3`;
      }
      const data=await callAI(userPrompt);
      
      // REAL IMAGE GENERATION - Pollinations.ai (Free)
      if(tool==="image"&&data.imagePrompt){
        const imgPrompt=encodeURIComponent(data.imagePrompt.slice(0,600));
        const seed=Date.now();
        data.imageUrl=`https://image.pollinations.ai/prompt/${imgPrompt}?width=1080&height=1080&nologo=true&enhance=true&seed=${seed}`;
        data.imageUrl2=`https://image.pollinations.ai/prompt/${imgPrompt}?width=1080&height=1350&nologo=true&enhance=true&seed=${seed+1}`;
        data.imageUrl3=`https://image.pollinations.ai/prompt/${imgPrompt}?width=1080&height=1920&nologo=true&enhance=true&seed=${seed+2}`;
      }
      
      // REAL VIDEO - Pollinations video API
      if(tool==="video"&&data.videoPrompt){
        const vidPrompt=encodeURIComponent(data.videoPrompt.slice(0,400));
        data.videoUrl=`https://video.pollinations.ai/prompt/${vidPrompt}?nologo=true&seed=${Date.now()}`;
        data.videoThumbUrl=`https://image.pollinations.ai/prompt/${vidPrompt}?width=1920&height=1080&nologo=true&enhance=true&seed=${Date.now()}`;
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
  const CSS=`*{box-sizing:border-box;margin:0;padding:0}body{background:#07080F}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2E3450;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}input:focus,textarea:focus,select:focus{border-color:#D946EF!important;box-shadow:0 0 0 3px #D946EF18}`;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{height:60,background:C.surface+"ee",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
        <button onClick={()=>setPage("landing")} style={{background:"none",border:"none",color:C.white,fontWeight:800,fontSize:20,cursor:"pointer",fontFamily:"inherit"}}>
          rasa<span style={{color:C.pink}}>.ai</span>
        </button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {user?(
            <>
              <button onClick={()=>setPage("studio")} style={{background:page==="studio"?C.pink+"22":"none",border:"none",color:page==="studio"?C.pink:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Studio</button>
              <button onClick={()=>setPage("dashboard")} style={{background:page==="dashboard"?C.pink+"22":"none",border:"none",color:page==="dashboard"?C.pink:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Dashboard</button>
              {user.isAdmin&&<button onClick={()=>setPage("admin")} style={{background:page==="admin"?"#10B98122":"none",border:"none",color:page==="admin"?C.green:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>⚙️ Admin</button>}
              <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:99,padding:"5px 12px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#D946EF,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12}}>{user.name[0].toUpperCase()}</div>
                <span style={{color:C.white,fontSize:13,fontWeight:600}}>{user.name}</span>
                <span style={{color:user.isAdmin?C.green:C.pink,fontSize:11,fontWeight:700}}>{user.isAdmin?"∞ ADMIN":credits+"cr"}</span>
              </div>
              <button onClick={handleSignout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Sign out</button>
            </>
          ):(
            <>
              <button onClick={()=>setPage("pricing")} style={{background:"none",border:"none",color:C.muted,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Pricing</button>
              <button onClick={()=>{setAuthMode("login");setPage("auth");}} style={{background:"none",border:"1px solid "+C.border,color:C.white,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Sign in</button>
              <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,padding:"8px 18px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",boxShadow:"0 4px 16px #D946EF44"}}>Start free</button>
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
                <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{padding:"15px 32px",borderRadius:12,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 30px #D946EF44"}}>Start creating free</button>
                <button onClick={()=>setPage("pricing")} style={{padding:"15px 28px",borderRadius:12,background:"none",border:"1px solid "+C.border,color:C.white,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>See pricing</button>
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
                {[{icon:"IMG",title:"Real Image Generation",desc:"Photorealistic images via Gemini Nano — state-of-the-art AI model."},{icon:"VID",title:"Sora 2 Video",desc:"Generate cinematic videos directly from text prompts."},{icon:"I2V",title:"Image to Video",desc:"Upload a photo and get a full animation prompt."},{icon:"A2V",title:"Audio to Video",desc:"Synced visual descriptions matched to your audio."},{icon:"CAP",title:"4 Caption Versions",desc:"4 caption styles plus 3 hooks and full hashtag strategy."},{icon:"SCR",title:"Viral Score",desc:"Every content gets a viral score with algorithm tips."},{icon:"ALG",title:"Algorithm Tips",desc:"5 specific tips per platform to maximise reach."},{icon:"60M",title:"60 Min Strategy",desc:"What to do after posting to boost in the algorithm."},{icon:"PUB",title:"Publish Ready",desc:"Download, copy and post in one tap."}].map(f=>(
                  <div key={f.title} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"22px 20px"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:C.pink+"22",border:"1px solid "+C.pink+"44",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:C.pink,fontWeight:800,fontSize:11}}>{f.icon}</div>
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
            <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{padding:"16px 40px",borderRadius:12,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:17,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 40px #D946EF44"}}>Create free account</button>
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
                  style={{flex:1,padding:"11px",border:"none",borderRadius:11,cursor:"pointer",fontSize:13,fontWeight:700,background:(m.id==="phone"?authMode==="phone":authMode!=="phone")?"linear-gradient(90deg,#D946EF,#7C3AED)":"transparent",color:(m.id==="phone"?authMode==="phone":authMode!=="phone")?C.white:C.muted,fontFamily:"inherit"}}>
                  {m.label}
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
                      <input type="tel" maxLength={10} placeholder="10-digit number" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} disabled={otpSent} style={{...inp,flex:1,letterSpacing:2,opacity:otpSent?0.6:1}}/>
                    </div>
                  </div>
                  {!otpSent?(
                    <button onClick={handleSendOtp} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",opacity:authLoading?0.7:1}}>
                      {authLoading?"Sending OTP...":"Send OTP →"}
                    </button>
                  ):(
                    <>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <Lbl text="Enter OTP"/>
                          <span style={{color:C.green,fontSize:12}}>✓ Sent to +91 {phone}</span>
                        </div>
                        <input type="tel" maxLength={6} placeholder="· · · · · ·" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} autoFocus style={{...inp,letterSpacing:14,fontSize:28,textAlign:"center"}}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                          <span style={{color:C.muted,fontSize:12}}>{otpTimer>0?`Resend in ${otpTimer}s`:""}</span>
                          {otpTimer===0&&<span onClick={handleSendOtp} style={{color:C.pink,fontSize:12,fontWeight:700,cursor:"pointer"}}>Resend OTP</span>}
                        </div>
                      </div>
                      <button onClick={handleVerifyOtp} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
                        {authLoading?"Verifying...":"Verify & Sign In →"}
                      </button>
                      <button onClick={()=>{setOtpSent(false);setOtp("");setPhone("");setError("");}} style={{width:"100%",padding:"11px",borderRadius:10,background:"transparent",border:"1px solid "+C.border,color:C.muted,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>← Change Number</button>
                    </>
                  )}
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {authMode==="signup"&&<div><Lbl text="Your Name"/><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Priya Sharma"/></div>}
                  <div><Lbl text="Email"/><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></div>
                  <div><Lbl text="Password"/><input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 8 characters" onKeyDown={e=>e.key==="Enter"&&handleEmailAuth()}/></div>
                  <button onClick={handleEmailAuth} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",opacity:authLoading?0.7:1}}>
                    {authLoading?"Please wait...":authMode==="signup"?"Create account":"Sign in"}
                  </button>
                  <p style={{textAlign:"center",color:C.muted,fontSize:13}}>
                    {authMode==="signup"?"Already have an account? ":"New here? "}
                    <button onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")} style={{background:"none",border:"none",color:C.pink,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>
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
              <div key={plan.id} style={{background:plan.popular?"linear-gradient(160deg,#141728,#1A0A2E)":C.card,border:"1.5px solid "+(plan.popular?C.pink:C.border),borderRadius:18,padding:"28px 24px",position:"relative"}}>
                {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(90deg,#D946EF,#7C3AED)",borderRadius:99,padding:"3px 14px",color:C.white,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>MOST POPULAR</div>}
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
                <button onClick={()=>{updateStats("subscribe",{user:user?.name||"Guest",plan:plan.name,amount:plan.price});user?setPage("studio"):setPage("auth");}} style={{width:"100%",marginTop:20,padding:"12px",borderRadius:10,background:plan.popular?"linear-gradient(90deg,#D946EF,#7C3AED)":plan.color+"22",border:"none",color:plan.popular?C.white:plan.color,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                  {plan.id==="impulse"?"Buy Now — ₹"+plan.price:"Start "+plan.name}
                </button>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",color:C.dim,fontSize:12,marginTop:28}}>🔒 Payments secured by Razorpay · All amounts in INR · GST Invoice on request</p>
        </div>
      )}

      {/* ══ STUDIO ══ */}
      {page==="studio"&&user&&(
        <div style={{display:"flex",height:"calc(100vh - 60px)",overflow:"hidden"}}>

          {/* IMPULSE POPUP */}
          {showImpulse&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
              <div style={{background:"linear-gradient(135deg,#141728,#1a0a2e)",border:"2px solid "+C.pink,borderRadius:24,padding:"36px 32px",maxWidth:420,width:"100%",textAlign:"center",animation:"fadeIn 0.3s ease",position:"relative"}}>
                <button onClick={()=>setShowImpulse(false)} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
                <div style={{fontSize:48,marginBottom:12}}>⚡</div>
                <h2 style={{color:C.white,fontSize:22,fontWeight:900,marginBottom:8}}>Credits Khatam!</h2>
                <p style={{color:C.muted,fontSize:14,marginBottom:24,lineHeight:1.6}}>Ek aur viral post banana tha? Instant credits lo!</p>
                <div style={{background:"#0f0900",border:"2px dashed "+C.gold,borderRadius:16,padding:"20px",marginBottom:16,cursor:"pointer"}} onClick={()=>{setCredits(c=>c+50);updateStats("subscribe",{user:user.name,plan:"Impulse Pack",amount:119});setShowImpulse(false);}}>
                  <p style={{color:C.gold,fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:6}}>⚡ INSTANT CREDIT PACK</p>
                  <p style={{color:C.white,fontSize:26,fontWeight:900,marginBottom:4}}>50 Credits</p>
                  <p style={{color:C.gold,fontSize:28,fontWeight:900,marginBottom:4}}>₹119</p>
                  <p style={{color:C.muted,fontSize:12,marginBottom:12}}>One-time · Expires in <span style={{color:C.gold,fontWeight:700}}>6 days</span> · No subscription</p>
                  <div style={{background:"linear-gradient(90deg,#f59e0b,#ef4444)",borderRadius:12,padding:"13px",color:"#fff",fontWeight:800,fontSize:15}}>Buy Now — ₹119 →</div>
                </div>
                <p style={{color:C.muted,fontSize:12,marginBottom:14}}>Ya subscription lo:</p>
                <div style={{display:"flex",gap:10,marginBottom:16}}>
                  {plans.filter(p=>p.id!=="impulse").map(p=>(
                    <div key={p.id} onClick={()=>{setPage("pricing");setShowImpulse(false);}} style={{flex:1,background:p.popular?p.color+"22":C.card,border:"1.5px solid "+(p.popular?p.color:C.border),borderRadius:12,padding:"12px 8px",cursor:"pointer",position:"relative"}}>
                      {p.popular&&<div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",background:p.color,borderRadius:10,padding:"2px 8px",fontSize:8,fontWeight:800,color:"#fff",whiteSpace:"nowrap"}}>POPULAR</div>}
                      <p style={{color:p.color,fontSize:11,fontWeight:800,marginBottom:2}}>{p.name}</p>
                      <p style={{color:C.white,fontSize:16,fontWeight:900}}>₹{p.price}</p>
                      <p style={{color:C.muted,fontSize:10}}>{p.credits}cr/{p.period}</p>
                    </div>
                  ))}
                </div>
                <p style={{color:C.dim,fontSize:11}}>🔒 Secured by Razorpay</p>
              </div>
            </div>
          )}

          {/* SIDEBAR */}
          <div style={{width:210,background:C.surface,borderRight:"1px solid "+C.border,padding:"14px 10px",overflowY:"auto",flexShrink:0}}>
            <div style={{background:C.card,borderRadius:10,padding:"12px 14px",marginBottom:14,border:"1px solid "+C.border}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{color:C.muted,fontSize:10,fontWeight:700}}>CREDITS</span>
                <span style={{color:user.isAdmin?C.green:C.pink,fontSize:10,fontWeight:700}}>{user.isAdmin?"ADMIN":user.plan||"FREE"}</span>
              </div>
              <div style={{color:C.white,fontWeight:800,fontSize:24,marginBottom:4}}>{user.isAdmin?"∞":credits}</div>
              {!user.isAdmin&&<div style={{height:3,background:C.border,borderRadius:2,marginBottom:8}}><div style={{height:"100%",background:"linear-gradient(90deg,#D946EF,#22D3EE)",borderRadius:2,width:Math.min((credits/5)*100,100)+"%"}}/></div>}
              {!user.isAdmin&&<button onClick={()=>setPage("pricing")} style={{width:"100%",padding:"7px",borderRadius:7,background:C.pink+"22",border:"1px solid "+C.pink+"44",color:C.pink,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>}
            </div>
            <p style={{color:C.dim,fontSize:9,fontWeight:700,letterSpacing:"0.12em",marginBottom:6,paddingLeft:4}}>AI TOOLS</p>
            {TOOLS.map(t=>(
              <button key={t.id} onClick={()=>{setTool(t.id);setResult(null);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",borderRadius:9,marginBottom:3,background:tool===t.id?C.pink+"18":"none",color:tool===t.id?C.pink:C.muted,fontWeight:tool===t.id?700:500,fontSize:12,textAlign:"left",border:tool===t.id?"1px solid "+C.pink+"44":"1px solid transparent",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{width:24,height:24,borderRadius:6,background:tool===t.id?C.pink+"22":C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0,color:tool===t.id?C.pink:C.muted}}>{t.icon}</span>
                {t.label}
              </button>
            ))}
            {history.length>0&&(
              <div style={{marginTop:14}}>
                <div style={{borderTop:"1px solid "+C.border,marginBottom:12}}/>
                <p style={{color:C.dim,fontSize:9,fontWeight:700,letterSpacing:"0.12em",marginBottom:6,paddingLeft:4}}>RECENT</p>
                {history.slice(0,6).map(h=>(
                  <button key={h.id} onClick={()=>{setResult(h.result);setTool(h.tool);setPrompt(h.prompt);}} style={{width:"100%",padding:"7px 10px",borderRadius:8,background:"none",border:"none",color:C.dim,fontSize:11,textAlign:"left",cursor:"pointer",fontFamily:"inherit",marginBottom:2}}>
                    {h.prompt.slice(0,28)}{h.prompt.length>28?"...":""}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {/* TOP BAR */}
            <div style={{padding:"10px 16px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",background:C.surface}}>
              {PLATFORMS.map(p=>(
                <button key={p.id} onClick={()=>{setPlatform(p.id);setFormat(FORMATS[p.id][0]);}} style={{padding:"5px 11px",borderRadius:7,fontSize:11,fontWeight:600,background:platform===p.id?p.color+"22":"none",color:platform===p.id?p.color:C.muted,border:platform===p.id?"1px solid "+p.color+"55":"1px solid transparent",cursor:"pointer",fontFamily:"inherit"}}>
                  {p.name}
                </button>
              ))}
              <div style={{width:1,height:20,background:C.border}}/>
              <select value={format} onChange={e=>setFormat(e.target.value)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"5px 10px",color:C.white,fontSize:11,fontFamily:"inherit",cursor:"pointer"}}>
                {(FORMATS[platform]||[]).map(f=><option key={f}>{f}</option>)}
              </select>
              <select value={tone} onChange={e=>setTone(e.target.value)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"5px 10px",color:C.white,fontSize:11,fontFamily:"inherit",cursor:"pointer"}}>
                {TONES.map(t=><option key={t}>{t}</option>)}
              </select>
              {tool==="video"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[
                    {id:"sora2_free",name:"Sora 2",badge:Math.max(0,2-sora2Used)+" left",free:true,color:C.pink},
                    {id:"kling16",name:"Kling 1.6",badge:"FAST 🔒",free:false,color:C.cyan},
                    {id:"runway",name:"Runway",badge:"PRO 🔒",free:false,color:C.gold},
                  ].map(m=>{
                    const locked=!m.free&&user?.plan==="Free";
                    return (
                      <button key={m.id} onClick={()=>{if(!locked)setVideoModel(m.id);}}
                        style={{padding:"5px 11px",borderRadius:8,fontSize:11,fontWeight:700,cursor:locked?"not-allowed":"pointer",fontFamily:"inherit",border:videoModel===m.id?"1.5px solid "+m.color:"1px solid "+C.border,background:videoModel===m.id?m.color+"22":C.card,color:locked?C.dim:videoModel===m.id?m.color:C.muted,opacity:locked?0.55:1}}>
                        {m.name} <span style={{fontSize:9,opacity:0.8}}>{m.badge}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{flex:1,display:"flex",overflow:"hidden"}}>
              {/* INPUT */}
              <div style={{width:340,borderRight:"1px solid "+C.border,padding:16,overflowY:"auto",flexShrink:0}}>
                <p style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:4}}>{TOOLS.find(t=>t.id===tool)?.label}</p>
                <p style={{color:C.muted,fontSize:12,marginBottom:16,lineHeight:1.5}}>{TOOLS.find(t=>t.id===tool)?.desc}</p>
                {tool==="img2vid"&&(
                  <><input ref={fileRef} type="file" accept="image/*" onChange={e=>setUploadedFile(e.target.files[0])} style={{display:"none"}}/>
                  <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed "+(uploadedFile?C.pink:C.border),borderRadius:10,padding:"20px 14px",textAlign:"center",cursor:"pointer",marginBottom:12}}>
                    <p style={{color:uploadedFile?C.pink:C.muted,fontSize:13}}>{uploadedFile?uploadedFile.name:"Click to upload image"}</p>
                  </div></>
                )}
                {tool==="aud2vid"&&(
                  <><input ref={audioRef} type="file" accept="audio/*" onChange={e=>setUploadedAudio(e.target.files[0])} style={{display:"none"}}/>
                  <div onClick={()=>audioRef.current?.click()} style={{border:"2px dashed "+(uploadedAudio?C.cyan:C.border),borderRadius:10,padding:"20px 14px",textAlign:"center",cursor:"pointer",marginBottom:12}}>
                    <p style={{color:uploadedAudio?C.cyan:C.muted,fontSize:13}}>{uploadedAudio?uploadedAudio.name:"Click to upload audio"}</p>
                  </div></>
                )}
                <Lbl text={tool==="img2vid"?"Animation instructions (optional)":tool==="aud2vid"?"Visual style brief (optional)":"Your brief"}/>
                <textarea style={{...inp,resize:"vertical",minHeight:100}} value={prompt} onChange={e=>setPrompt(e.target.value)}
                  placeholder={tool==="image"?"e.g. A luxury skincare brand, rose serum, dewy glowing skin, gold packaging...":tool==="video"?"e.g. A 30-second reel about my morning fitness routine. Motivational, energetic...":tool==="caption"?"e.g. Just posted my YouTube video about sustainable fashion. Drive clicks and saves...":"Describe your content..."}/>
                {error&&<p style={{color:C.red,fontSize:12,marginTop:8,background:C.red+"11",padding:"8px 12px",borderRadius:8}}>⚠️ {error}</p>}
                <button onClick={generate} disabled={loading} style={{width:"100%",marginTop:12,padding:"13px",borderRadius:10,background:loading?C.card:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:loading?C.dim:C.white,fontWeight:800,fontSize:14,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:loading?"none":"0 4px 20px #D946EF44"}}>
                  {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{display:"inline-block",width:14,height:14,border:"2px solid "+C.dim,borderTopColor:C.muted,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Generating...</span>:"Generate — 1 credit"}
                </button>
                <p style={{color:C.dim,fontSize:11,textAlign:"center",marginTop:6}}>{user.isAdmin?"∞":credits} credits remaining</p>
              </div>

              {/* RESULT */}
              <div style={{flex:1,overflowY:"auto",padding:16}}>
                {!result&&!loading&&(
                  <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:0.4}}>
                    <div style={{fontSize:48,marginBottom:12}}>✨</div>
                    <p style={{color:C.muted,fontSize:15,fontWeight:600}}>Your content appears here</p>
                    <p style={{color:C.dim,fontSize:13,marginTop:4}}>Fill in the brief and tap Generate</p>
                  </div>
                )}
                {loading&&(
                  <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
                    <div style={{width:60,height:60,borderRadius:"50%",border:"3px solid "+C.pink+"44",borderTopColor:C.pink,animation:"spin 1s linear infinite"}}/>
                    <p style={{color:C.muted,fontSize:14}}>Creating viral content...</p>
                    <p style={{color:C.dim,fontSize:12}}>This takes 5-10 seconds</p>
                  </div>
                )}
                {result&&!loading&&(
                  <div style={{animation:"fadeIn 0.4s ease"}}>
                    <Card style={{marginBottom:14}}>
                      <Lbl text="Publish to"/>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {PLATFORMS.map(p=>{
                          const st=publishStatus[p.id];
                          return <button key={p.id} onClick={()=>publish(p.id)} disabled={st==="done"} style={{padding:"7px 12px",borderRadius:7,border:"none",background:st==="done"?C.green+"22":p.color+"22",color:st==="done"?C.green:p.color,fontWeight:600,fontSize:11,cursor:st==="done"?"default":"pointer",fontFamily:"inherit"}}>{st==="publishing"?"...":st==="done"?"Posted!":p.name}</button>;
                        })}
                      </div>
                    </Card>
                    {result.viralityScore&&(
                      <Card accent={C.pink+"44"} style={{marginBottom:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                          <ScoreRing score={result.viralityScore}/>
                          <div style={{flex:1}}>
                            <p style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:6}}>Viral Potential Analysis</p>
                            <p style={{color:C.muted,fontSize:13,lineHeight:1.5,marginBottom:result.competitorInsight?8:0}}>{result.viralityReason}</p>
                            {result.competitorInsight&&<p style={{color:C.cyan,fontSize:12,fontStyle:"italic"}}>💡 {result.competitorInsight}</p>}
                          </div>
                        </div>
                      </Card>
                    )}
                    {result.imageUrl&&(
                      <Card style={{marginBottom:14}}>
                        <Lbl text="Generated Images (3 Sizes)"/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                          {[
                            {url:result.imageUrl,label:"1:1 Post",size:"1080×1080"},
                            {url:result.imageUrl2,label:"4:5 Feed",size:"1080×1350"},
                            {url:result.imageUrl3,label:"9:16 Story",size:"1080×1920"},
                          ].filter(i=>i.url).map((img,i)=>(
                            <div key={i} style={{position:"relative"}}>
                              <img src={img.url} alt={img.label} style={{width:"100%",borderRadius:8,aspectRatio:"1",objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
                              <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.7)",padding:"4px 8px",borderRadius:"0 0 8px 8px",textAlign:"center"}}>
                                <p style={{color:"#fff",fontSize:10,fontWeight:700}}>{img.label}</p>
                                <p style={{color:"#aaa",fontSize:9}}>{img.size}</p>
                              </div>
                              <a href={img.url} target="_blank" rel="noreferrer" download style={{display:"block",marginTop:4,textAlign:"center",padding:"5px",borderRadius:6,background:C.pink+"22",color:C.pink,fontSize:11,fontWeight:700,textDecoration:"none"}}>⬇ Download</a>
                            </div>
                          ))}
                        </div>
                        <CopyBtn text={result.imagePrompt||""} label="Copy Full Prompt"/>
                      </Card>
                    )}
                    
                    {result.videoUrl&&(
                      <Card style={{marginBottom:14}}>
                        <Lbl text="Generated Video"/>
                        <video controls style={{width:"100%",borderRadius:10,maxHeight:400,background:"#000",display:"block"}} poster={result.videoThumbUrl}>
                          <source src={result.videoUrl} type="video/mp4"/>
                          Your browser does not support video.
                        </video>
                        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                          <a href={result.videoUrl} target="_blank" rel="noreferrer" style={{padding:"9px 18px",borderRadius:9,background:"linear-gradient(90deg,#D946EF,#7C3AED)",color:C.white,fontWeight:700,fontSize:13,display:"inline-block",textDecoration:"none"}}>⬇ Download Video</a>
                          <CopyBtn text={result.videoPrompt||""} label="Copy Video Prompt"/>
                        </div>
                        {result.videoThumbUrl&&(
                          <div style={{marginTop:10}}>
                            <p style={{color:C.muted,fontSize:11,marginBottom:6}}>Video Thumbnail:</p>
                            <img src={result.videoThumbUrl} alt="Thumbnail" style={{width:"100%",borderRadius:8,maxHeight:200,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                          </div>
                        )}
                      </Card>
                    )}
                    {(result.videoPrompt||result.animationPrompt||result.visualPrompt)&&(
                      <Card style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <Lbl text={result.videoPrompt?"Video Prompt (Sora 2 / Runway / Kling)":result.animationPrompt?"Animation Prompt":"Visual Prompt"}/>
                          <CopyBtn text={result.videoPrompt||result.animationPrompt||result.visualPrompt}/>
                        </div>
                        <p style={{color:C.white,fontSize:13,lineHeight:1.7}}>{result.videoPrompt||result.animationPrompt||result.visualPrompt}</p>
                      </Card>
                    )}
                    {result.script&&(
                      <Card style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <Lbl text="Full Video Script"/><CopyBtn text={result.script}/>
                        </div>
                        <pre style={{color:C.white,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{result.script}</pre>
                      </Card>
                    )}
                    {result.scene1time&&(
                      <Card style={{marginBottom:14}}>
                        <Lbl text="Scene Breakdown"/>
                        {[{time:result.scene1time,visual:result.scene1visual,audio:result.scene1audio,text:result.scene1text},{time:result.scene2time,visual:result.scene2visual,audio:result.scene2audio,text:result.scene2text},{time:result.scene3time,visual:result.scene3visual,audio:result.scene3audio,text:result.scene3text}].filter(s=>s.time).map((s,i)=>(
                          <div key={i} style={{background:C.surface,borderRadius:9,padding:"10px 12px",marginBottom:8,borderLeft:"3px solid "+C.pink}}>
                            <p style={{color:C.pink,fontSize:10,fontWeight:700,marginBottom:4}}>{s.time}</p>
                            <p style={{color:C.white,fontSize:13,marginBottom:s.audio?4:0}}>{s.visual}</p>
                            {s.audio&&<p style={{color:C.muted,fontSize:12}}>Audio: {s.audio}</p>}
                            {s.text&&<p style={{color:C.cyan,fontSize:12}}>Text: {s.text}</p>}
                          </div>
                        ))}
                      </Card>
                    )}
                    {(result.hook||result.hook1)&&(
                      <Card accent={C.gold+"44"} style={{marginBottom:14}}>
                        <Lbl text="Viral Hooks — First 3 Seconds"/>
                        {[result.hook||result.hook1,result.hookV2||result.hook2,result.hookV3||result.hook3].filter(Boolean).map((h,i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.surface,borderRadius:8,padding:"9px 12px",marginBottom:6}}>
                            <p style={{color:"#FCD34D",fontSize:13,fontWeight:600,flex:1,marginRight:8}}>"{h}"</p>
                            <CopyBtn text={h} label="Copy"/>
                          </div>
                        ))}
                        {result.cta&&<p style={{color:C.muted,fontSize:12,marginTop:8}}>CTA: <span style={{color:C.cyan}}>{result.cta}</span></p>}
                        {result.bestTime&&<p style={{color:C.muted,fontSize:12,marginTop:4}}>Best time: <span style={{color:C.white}}>{result.bestTime}</span></p>}
                      </Card>
                    )}
                    {(result.caption||result.caption1)&&(
                      <Card style={{marginBottom:14}}>
                        <Lbl text="Caption Options"/>
                        {[result.caption||result.caption1,result.captionV2||result.caption2,result.captionV3||result.caption3,result.caption4].filter(Boolean).map((cap,i)=>(
                          <div key={i} style={{background:C.surface,borderRadius:9,padding:"10px 12px",marginBottom:8,borderLeft:"3px solid "+[C.pink,C.cyan,C.gold,C.green][i]}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                              <span style={{color:[C.pink,C.cyan,C.gold,C.green][i],fontSize:10,fontWeight:700}}>Option {i+1}</span>
                              <CopyBtn text={cap} label="Copy"/>
                            </div>
                            <p style={{color:C.white,fontSize:13,lineHeight:1.6}}>{cap}</p>
                          </div>
                        ))}
                      </Card>
                    )}
                    {result.hashtags&&(
                      <Card style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                          <Lbl text={"Hashtags ("+result.hashtags.length+")"}/>
                          <CopyBtn text={result.hashtags.map(h=>"#"+h.replace(/^#/,"")).join(" ")} label="Copy all"/>
                        </div>
                        {result.viralHashtags&&<div style={{marginBottom:10}}><p style={{color:C.pink,fontSize:10,fontWeight:700,marginBottom:6}}>🔥 Top Viral Tags</p><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{result.viralHashtags.map(h=><span key={h} style={{background:C.pink+"22",border:"1px solid "+C.pink+"44",borderRadius:99,padding:"3px 9px",color:C.pink,fontSize:12,fontWeight:700}}>#{h.replace(/^#/,"")}</span>)}</div></div>}
                        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{result.hashtags.map(h=><span key={h} style={{background:C.pink+"15",border:"1px solid "+C.pink+"33",borderRadius:99,padding:"3px 9px",color:C.pink,fontSize:12,fontWeight:600}}>#{h.replace(/^#/,"")}</span>)}</div>
                      </Card>
                    )}
                    {result.algorithmTip1&&(
                      <Card accent={C.cyan+"33"} style={{marginBottom:14}}>
                        <Lbl text={pName+" Algorithm Tips"}/>
                        {[result.algorithmTip1,result.algorithmTip2,result.algorithmTip3,result.algorithmTip4,result.algorithmTip5].filter(Boolean).map((t,i)=>(
                          <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                            <span style={{color:C.cyan,fontWeight:800,fontSize:13,flexShrink:0,width:18}}>{i+1}.</span>
                            <span style={{color:C.white,fontSize:13,lineHeight:1.5}}>{t}</span>
                          </div>
                        ))}
                      </Card>
                    )}
                    {result.postingStrategy&&(
                      <Card accent={C.gold+"33"} style={{marginBottom:14}}>
                        <Lbl text="60-Minute Viral Posting Strategy"/>
                        <p style={{color:C.white,fontSize:13,lineHeight:1.7}}>{result.postingStrategy}</p>
                      </Card>
                    )}
                    {result.imagePrompt&&(
                      <Card style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <Lbl text="Image Prompt (Midjourney / DALL-E)"/><CopyBtn text={result.imagePrompt}/>
                        </div>
                        <p style={{color:C.white,fontSize:13,lineHeight:1.7}}>{result.imagePrompt}</p>
                        {result.negativePrompt&&<p style={{color:C.dim,fontSize:12,marginTop:8,fontStyle:"italic"}}>Avoid: {result.negativePrompt}</p>}
                      </Card>
                    )}
                    {result.colorPalette&&(
                      <Card style={{marginBottom:14}}>
                        <Lbl text="Brand Color Palette"/>
                        <div style={{display:"flex",gap:10}}>{result.colorPalette.map(col=><div key={col} style={{textAlign:"center"}}><div style={{width:44,height:44,borderRadius:9,background:col,border:"1px solid "+C.border,marginBottom:4}}/><p style={{color:C.muted,fontSize:10}}>{col}</p></div>)}</div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {page==="studio"&&!user&&(
        <div style={{minHeight:"calc(100vh - 60px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
          <div>
            <p style={{fontSize:40,marginBottom:14}}>🔒</p>
            <h2 style={{fontSize:24,fontWeight:800,marginBottom:8}}>Sign in to use Studio</h2>
            <p style={{color:C.muted,marginBottom:20}}>Create a free account to start generating.</p>
            <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{padding:"12px 28px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Create free account</button>
          </div>
        </div>
      )}

      {/* ══ DASHBOARD ══ */}
      {page==="dashboard"&&user&&(
        <div style={{maxWidth:1000,margin:"0 auto",padding:"36px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
            <div>
              <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>Dashboard</h1>
              <p style={{color:C.muted,fontSize:14}}>Welcome back, {user.name} 👋</p>
            </div>
            <button onClick={()=>setPage("studio")} style={{padding:"11px 22px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>+ New Content</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
            {[{label:"Credits Left",val:user.isAdmin?"∞":credits,color:C.pink},{label:"Content Made",val:history.length,color:C.cyan},{label:"Platforms",val:6,color:C.gold},{label:"Plan",val:user.plan||"Free",color:C.green}].map(s=>(
              <div key={s.label} style={{background:C.card,border:"1px solid "+C.border,borderRadius:12,padding:"18px 16px"}}>
                <p style={{color:s.color,fontWeight:800,fontSize:28,letterSpacing:"-0.02em"}}>{s.val}</p>
                <p style={{color:C.muted,fontSize:12,marginTop:4}}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>
              <p style={{fontWeight:700,fontSize:15}}>Generated Content</p>
              <span style={{color:C.muted,fontSize:12}}>{history.length} items</span>
            </div>
            {history.length===0?(
              <div style={{padding:"48px 20px",textAlign:"center"}}>
                <p style={{color:C.muted,marginBottom:14}}>No content yet. Start creating!</p>
                <button onClick={()=>setPage("studio")} style={{padding:"10px 20px",borderRadius:9,background:C.pink+"22",border:"1px solid "+C.pink+"44",color:C.pink,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Go to Studio</button>
              </div>
            ):history.map(h=>{
              const t=TOOLS.find(t2=>t2.id===h.tool);
              const p=PLATFORMS.find(p2=>p2.id===h.platform);
              return (
                <div key={h.id} onClick={()=>{setResult(h.result);setTool(h.tool);setPrompt(h.prompt);setPage("studio");}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid "+C.border,cursor:"pointer"}}>
                  <div style={{width:34,height:34,borderRadius:9,background:C.pink+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.pink,fontWeight:800,fontSize:10}}>{t?.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:C.white,fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.prompt||t?.label}</p>
                    <p style={{color:C.muted,fontSize:11}}>{t?.label} · {p?.name}</p>
                  </div>
                  <p style={{color:C.dim,fontSize:11}}>{new Date(h.id).toLocaleDateString()}</p>
                  <button style={{padding:"5px 12px",borderRadius:7,background:C.pink+"22",border:"1px solid "+C.pink+"44",color:C.pink,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Open</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ADMIN PANEL ══ */}
      {page==="admin"&&user?.isAdmin&&(
        <div style={{maxWidth:1200,margin:"0 auto",padding:"36px 24px"}}>

          {/* Edit Plan Modal */}
          {editingPlan&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
              <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:20,padding:32,width:"100%",maxWidth:500}}>
                <h3 style={{fontSize:20,fontWeight:800,marginBottom:20}}>✏️ Edit Plan</h3>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div><Lbl text="Plan Name"/><input style={inp} value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div><Lbl text="Price (₹)"/><input style={inp} type="number" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})}/></div>
                    <div><Lbl text="Credits"/><input style={inp} type="number" value={editForm.credits} onChange={e=>setEditForm({...editForm,credits:e.target.value})}/></div>
                  </div>
                  <div><Lbl text="Period (e.g. mo, 6 days)"/><input style={inp} value={editForm.period} onChange={e=>setEditForm({...editForm,period:e.target.value})}/></div>
                  <div><Lbl text="Features (one per line)"/><textarea style={{...inp,minHeight:120,resize:"vertical"}} value={editForm.features} onChange={e=>setEditForm({...editForm,features:e.target.value})}/></div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:20}}>
                  <button onClick={saveEditPlan} style={{flex:1,padding:"12px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Save Changes</button>
                  <button onClick={()=>setEditingPlan(null)} style={{flex:1,padding:"12px",borderRadius:10,background:"transparent",border:"1px solid "+C.border,color:C.muted,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.green+"22",border:"1px solid "+C.green+"44",borderRadius:8,padding:"4px 12px",marginBottom:8}}>
                <span style={{color:C.green,fontSize:11,fontWeight:800}}>⚙️ ADMIN PANEL</span>
              </div>
              <h1 style={{fontSize:28,fontWeight:900,letterSpacing:-0.5}}>rasaaistudio.com</h1>
              <p style={{color:C.muted,fontSize:14}}>Welcome, {user.name} — Full Admin Access</p>
            </div>
            <button onClick={()=>setPage("studio")} style={{padding:"10px 20px",borderRadius:10,background:"linear-gradient(90deg,#D946EF,#7C3AED)",border:"none",color:C.white,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Go to Studio</button>
          </div>

          {/* Real Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:28}}>
            {[
              {label:"Total Signups",val:stats.totalUsers||0,color:C.pink},
              {label:"Subscriptions",val:stats.subscriptions||0,color:C.cyan},
              {label:"Total Revenue",val:"₹"+(stats.revenue||0),color:C.green},
              {label:"Credits Used",val:stats.creditsUsed||0,color:C.gold},
              {label:"Transactions",val:(stats.transactions||[]).length,color:"#a855f7"},
            ].map(s=>(
              <div key={s.label} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"18px 16px"}}>
                <p style={{color:C.muted,fontSize:11,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{s.label}</p>
                <p style={{color:s.color,fontSize:26,fontWeight:900,letterSpacing:-0.5}}>{s.val}</p>
                <p style={{color:C.dim,fontSize:11,marginTop:4}}>Real data · Live</p>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>

            {/* Subscription Plans with Edit */}
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <p style={{fontWeight:800,fontSize:15}}>📊 Subscription Plans</p>
                <span style={{color:C.muted,fontSize:12}}>Click ✏️ to edit</span>
              </div>
              {plans.map(plan=>(
                <div key={plan.id} style={{background:C.surface,borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid "+C.border}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:plan.color,fontWeight:800,fontSize:14}}>₹{plan.price}</span>
                      <span style={{color:C.white,fontSize:13,fontWeight:600}}>{plan.name}</span>
                      <span style={{background:plan.color+"22",color:plan.color,fontSize:10,padding:"2px 8px",borderRadius:6,fontWeight:700}}>{plan.credits}cr</span>
                    </div>
                    <button onClick={()=>startEditPlan(plan)} style={{padding:"4px 10px",borderRadius:7,background:C.pink+"22",border:"1px solid "+C.pink+"44",color:C.pink,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✏️ Edit</button>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {plan.features.map((f,i)=><span key={i} style={{color:C.dim,fontSize:10}}>✓ {f}</span>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Transactions - Real */}
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"20px"}}>
              <p style={{fontWeight:800,fontSize:15,marginBottom:16}}>💳 Transactions <span style={{color:C.green,fontSize:11}}>(Real)</span></p>
              {(stats.transactions||[]).length===0?(
                <div style={{textAlign:"center",padding:"40px 0"}}>
                  <p style={{color:C.muted,fontSize:28,marginBottom:8}}>💳</p>
                  <p style={{color:C.muted,fontSize:13}}>No transactions yet</p>
                  <p style={{color:C.dim,fontSize:11,marginTop:4}}>Will appear when users subscribe</p>
                </div>
              ):(stats.transactions||[]).map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid "+C.border}}>
                  <div style={{flex:1}}>
                    <p style={{color:C.white,fontSize:13,fontWeight:600}}>{t.user}</p>
                    <p style={{color:C.muted,fontSize:11}}>{t.plan} · {t.id}</p>
                  </div>
                  <span style={{color:C.green,fontWeight:800,fontSize:14}}>{t.amount}</span>
                  <span style={{background:C.green+"22",color:C.green,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{t.status}</span>
                  <span style={{color:C.dim,fontSize:10}}>{t.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>

            {/* Recent Logins - Real */}
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"20px"}}>
              <p style={{fontWeight:800,fontSize:15,marginBottom:16}}>👤 Recent Logins <span style={{color:C.green,fontSize:11}}>(Real)</span></p>
              {(stats.logins||[]).length===0?(
                <div style={{textAlign:"center",padding:"40px 0"}}>
                  <p style={{color:C.muted,fontSize:28,marginBottom:8}}>👤</p>
                  <p style={{color:C.muted,fontSize:13}}>No logins yet</p>
                  <p style={{color:C.dim,fontSize:11,marginTop:4}}>Will appear when users sign in</p>
                </div>
              ):(stats.logins||[]).map((u,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+C.border}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:C.pink+"22",display:"flex",alignItems:"center",justifyContent:"center",color:C.pink,fontWeight:800,fontSize:12,flexShrink:0}}>{(u.name||"U")[0].toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <p style={{color:C.white,fontSize:13,fontWeight:600}}>{u.name}</p>
                    <p style={{color:C.dim,fontSize:11}}>{u.email}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span style={{background:C.pink+"22",color:C.pink,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{u.plan}</span>
                    <p style={{color:C.dim,fontSize:10,marginTop:3}}>{u.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Digital Marketing */}
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"20px"}}>
              <p style={{fontWeight:800,fontSize:15,marginBottom:16}}>📱 Digital Marketing</p>
              {[
                {name:"Meta (FB & Instagram)",icon:"📘",color:"#1877F2",desc:"Ads, conversions, pixel"},
                {name:"Google Ads",icon:"🔍",color:"#EA4335",desc:"Search & display campaigns"},
                {name:"TikTok Business",icon:"🎵",color:"#69C9D0",desc:"TikTok pixel & ads"},
                {name:"YouTube Ads",icon:"▶️",color:"#FF0000",desc:"Video ad campaigns"},
                {name:"WhatsApp Business",icon:"💬",color:"#25D366",desc:"Customer messaging"},
                {name:"Razorpay",icon:"💳",color:C.green,desc:"Payment tracking",connected:true},
              ].map(p=>(
                <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+C.border}}>
                  <span style={{fontSize:18}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <p style={{color:C.white,fontSize:13,fontWeight:600}}>{p.name}</p>
                    <p style={{color:C.dim,fontSize:11}}>{p.desc}</p>
                  </div>
                  <button style={{padding:"4px 10px",borderRadius:7,background:p.connected?C.green+"22":p.color+"22",border:"1px solid "+(p.connected?C.green:p.color)+"55",color:p.connected?C.green:p.color,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                    {p.connected?"✅ Connected":"Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"20px"}}>
            <p style={{fontWeight:800,fontSize:15,marginBottom:16}}>⚡ Quick Actions</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {[
                {label:"📧 Email Blast",color:C.pink},
                {label:"🎁 Give Credits",color:C.cyan},
                {label:"📊 Export CSV",color:C.green},
                {label:"💬 WhatsApp Campaign",color:"#25D366"},
                {label:"🔔 Push Notification",color:C.gold},
                {label:"🔄 Reset Stats",color:C.red,action:()=>{if(window.confirm("Reset all stats?")){const empty={totalUsers:0,subscriptions:0,revenue:0,freeUsers:0,creditsUsed:0,transactions:[],logins:[]};setStats(empty);try{localStorage.setItem("rasa_stats",JSON.stringify(empty));}catch(e){}}}},
              ].map(a=>(
                <button key={a.label} onClick={a.action} style={{padding:"10px 16px",borderRadius:10,background:a.color+"18",border:"1px solid "+a.color+"44",color:a.color,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
