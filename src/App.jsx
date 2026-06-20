import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   RASA.AI — Complete Social Media Influencer Platform
   Design: Deep obsidian + electric magenta + liquid gold
   Signature: Morphing orb hero that reacts to user interaction
═══════════════════════════════════════════════════════════════ */

// ── Constants ──────────────────────────────────────────────────
const COLORS = {
  bg: "#07080F",
  surface: "#0E1120",
  card: "#141728",
  border: "#1E2340",
  borderBright: "#2A3060",
  magenta: "#D946EF",
  magentaDark: "#A21CAF",
  magentaGlow: "#D946EF33",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  cyan: "#22D3EE",
  cyanGlow: "#22D3EE22",
  white: "#F8FAFF",
  muted: "#8892B0",
  dim: "#3D4466",
  green: "#10B981",
  red: "#F87171",
};

const PLANS = [
  {
    name: "Starter", price: 9, priceYear: 7, color: COLORS.cyan,
    credits: 50, desc: "Perfect for new influencers",
    features: ["50 AI credits/month","Image generation","Caption & hashtag AI","3 platform publish","720p downloads","Email support"],
    notIncluded: ["Video generation","Audio to Video","Team seats","API access"],
  },
  {
    name: "Creator", price: 29, priceYear: 23, color: COLORS.magenta, popular: true,
    credits: 300, desc: "For serious content creators",
    features: ["300 AI credits/month","Image & video generation","Text to Video","Image to Video","Audio to Video","All platforms publish","4K downloads","Priority support","Brand kit","Content scheduler"],
    notIncluded: ["Team seats","White-label","API access"],
  },
  {
    name: "Pro", price: 79, priceYear: 63, color: COLORS.gold,
    credits: 1000, desc: "For agencies & power users",
    features: ["1000 AI credits/month","Everything in Creator","5 team seats","White-label exports","API access","Custom brand voice","Advanced analytics","Dedicated manager","SLA guarantee"],
    notIncluded: [],
  },
];

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C", grad: ["#f09433","#dc2743","#bc1888"] },
  { id: "youtube",   name: "YouTube",   icon: "▶️",  color: "#FF0000", grad: ["#FF0000","#CC0000"] },
  { id: "facebook",  name: "Facebook",  icon: "📘",  color: "#1877F2", grad: ["#1877F2","#0052CC"] },
  { id: "tiktok",    name: "TikTok",    icon: "🎵",  color: "#010101", grad: ["#010101","#69C9D0"] },
  { id: "twitter",   name: "X / Twitter",icon:"🐦", color: "#1DA1F2", grad: ["#1DA1F2","#0C85D0"] },
  { id: "linkedin",  name: "LinkedIn",  icon: "💼",  color: "#0077B5", grad: ["#0077B5","#005582"] },
];

const STUDIO_TOOLS = [
  { id: "text-image",   label: "Text → Image",   icon: "🎨", desc: "Describe any visual, get photorealistic results" },
  { id: "text-video",   label: "Text → Video",   icon: "🎬", desc: "Turn scripts into cinematic video content" },
  { id: "image-video",  label: "Image → Video",  icon: "✨", desc: "Animate your photos into dynamic videos" },
  { id: "audio-video",  label: "Audio → Video",  icon: "🎙️", desc: "Generate video from voiceover or music" },
  { id: "caption",      label: "AI Caption",     icon: "✍️", desc: "Platform-perfect captions with hashtags" },
  { id: "resize",       label: "Smart Resize",   icon: "📐", desc: "Reformat any content for every platform" },
];

const FORMATS = {
  instagram: ["Post (1:1)","Story (9:16)","Reel (9:16)","Carousel"],
  youtube:   ["Short (9:16)","Video (16:9)","Thumbnail","Community Post"],
  facebook:  ["Post (4:5)","Story (9:16)","Reel (9:16)","Cover Photo"],
  tiktok:    ["Video (9:16)","Photo Mode","Story"],
  twitter:   ["Post (16:9)","Card (2:1)","Header"],
  linkedin:  ["Post (1.91:1)","Story","Article Cover"],
};

const TONES = ["Viral & Trendy","Luxe & Premium","Funny & Relatable","Educational","Inspirational","Edgy & Bold","Minimalist","Storytelling"];

// ── Utility ────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function useTypewriter(text, speed = 18, active = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active || !text) return;
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);
  return displayed;
}

// ── Claude API call ────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, maxTokens = 1200) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "sk-ant-api03-YOUR-KEY-HERE",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("").replace(/```json\n?|```/g, "").trim();
}
// ── SVG Logo ───────────────────────────────────────────────────
function RasaLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D946EF"/>
          <stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#lg1)" opacity="0.15"/>
      <circle cx="20" cy="20" r="18" stroke="url(#lg1)" strokeWidth="1.5" fill="none"/>
      <path d="M13 14 C13 14 16 12 20 14 C24 16 26 20 20 22 C16 23.5 14 22 16 26" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="27" cy="27" r="3" fill="#D946EF"/>
    </svg>
  );
}

// ── Animated Orb ───────────────────────────────────────────────
function MorphOrb({ size = 320, interactive = true }) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const ref = useRef();
  useEffect(() => {
    if (!interactive) return;
    const el = ref.current?.closest("[data-orb-zone]");
    if (!el) return;
    const fn = e => {
      const r = el.getBoundingClientRect();
      setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    el.addEventListener("mousemove", fn);
    return () => el.removeEventListener("mousemove", fn);
  }, [interactive]);

  const px = pos.x * 40 - 20, py = pos.y * 40 - 20;
  return (
    <div ref={ref} style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle at ${50+px*0.3}% ${50+py*0.3}%, #D946EF44 0%, #22D3EE22 45%, transparent 70%)`,
        animation: "orbPulse 4s ease-in-out infinite",
        filter: "blur(2px)",
      }}/>
      <svg width={size} height={size} viewBox="0 0 320 320" style={{ position:"absolute", inset:0 }}>
        <defs>
          <radialGradient id="orbGrad" cx={`${50+px*0.5}%`} cy={`${50+py*0.5}%`} r="50%">
            <stop offset="0%" stopColor="#D946EF" stopOpacity="0.9"/>
            <stop offset="40%" stopColor="#7C3AED" stopOpacity="0.6"/>
            <stop offset="70%" stopColor="#22D3EE" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#07080F" stopOpacity="0"/>
          </radialGradient>
          <filter id="orbBlur"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <ellipse cx={160+px*0.8} cy={160+py*0.8} rx="115" ry="110" fill="url(#orbGrad)" filter="url(#orbBlur)"/>
        <ellipse cx={160+px*0.4} cy={160+py*0.4} rx="88" ry="84" fill="none" stroke="#D946EF" strokeWidth="0.8" strokeOpacity="0.4"
          strokeDasharray="4 8" style={{animation:"orbSpin 12s linear infinite"}}/>
        <ellipse cx={160-px*0.3} cy={160-py*0.3} rx="68" ry="72" fill="none" stroke="#22D3EE" strokeWidth="0.5" strokeOpacity="0.3"
          strokeDasharray="2 12" style={{animation:"orbSpin 18s linear infinite reverse"}}/>
        {[0,60,120,180,240,300].map((a,i) => {
          const r = 100 + i%2*15, rad = (a+px)*Math.PI/180;
          const x = 160+r*Math.cos(rad), y = 160+r*Math.sin(rad);
          return <circle key={a} cx={x} cy={y} r={2+i%3} fill={i%2?"#D946EF":"#22D3EE"} opacity="0.6"
            style={{animation:`orbPulse ${2+i*0.4}s ease-in-out infinite`}}/>;
        })}
      </svg>
      {/* Center glow text */}
      <div style={{
        position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ fontSize:56, marginBottom:4 }}>✦</div>
        <div style={{ color:"#D946EF", fontFamily:"'Clash Display',sans-serif", fontSize:13, fontWeight:700, letterSpacing:"0.3em", opacity:0.9 }}>RASA.AI</div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background: type==="error" ? "#2D0000" : "#001A0F",
      border:`1px solid ${type==="error"?COLORS.red:COLORS.green}`,
      borderRadius:12, padding:"14px 20px", display:"flex", gap:10, alignItems:"center",
      boxShadow:`0 8px 32px ${type==="error"?"#F8717133":"#10B98133"}`,
      animation:"slideUp 0.3s ease",
      maxWidth: 340,
    }}>
      <span style={{fontSize:18}}>{type==="error"?"❌":"✅"}</span>
      <span style={{color:COLORS.white,fontSize:14,fontFamily:"'Inter',sans-serif"}}>{msg}</span>
    </div>
  );
}

// ── Section heading ────────────────────────────────────────────
function SectionHead({ eyebrow, title, sub, center=true }) {
  return (
    <div style={{ textAlign: center?"center":"left", marginBottom: 56 }}>
      {eyebrow && (
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:`${COLORS.magenta}15`, border:`1px solid ${COLORS.magenta}40`,
          borderRadius:999, padding:"5px 16px", marginBottom:16,
        }}>
          <div style={{width:6,height:6,borderRadius:3,background:COLORS.magenta,animation:"pulse 1.5s infinite"}}/>
          <span style={{color:COLORS.magenta,fontSize:11,fontWeight:700,letterSpacing:"0.12em",fontFamily:"'Inter',sans-serif"}}>{eyebrow}</span>
        </div>
      )}
      <h2 style={{
        margin:"0 0 14px", fontSize:"clamp(28px,4vw,44px)",
        fontWeight:800, color:COLORS.white, lineHeight:1.15,
        letterSpacing:"-0.02em", fontFamily:"'Inter',sans-serif",
      }}>{title}</h2>
      {sub && <p style={{ color:COLORS.muted, fontSize:"clamp(14px,1.8vw,17px)", maxWidth:560, margin: center?"0 auto":0, lineHeight:1.7, fontFamily:"'Inter',sans-serif" }}>{sub}</p>}
    </div>
  );
}

// ── Pricing card ───────────────────────────────────────────────
function PricingCard({ plan, yearly, onSelect, active }) {
  const price = yearly ? plan.priceYear : plan.price;
  return (
    <div onClick={()=>onSelect(plan)} style={{
      background: plan.popular ? `linear-gradient(160deg,${COLORS.card},#1A0A2E)` : COLORS.card,
      border:`1.5px solid ${plan.popular ? COLORS.magenta : COLORS.border}`,
      borderRadius:20, padding:"32px 28px", cursor:"pointer", position:"relative",
      boxShadow: plan.popular ? `0 0 48px ${COLORS.magenta}25` : "none",
      transform: active===plan.name ? "translateY(-4px)" : "none",
      transition:"all 0.25s",
    }}>
      {plan.popular && (
        <div style={{
          position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
          background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`,
          borderRadius:999, padding:"4px 18px",
          color:COLORS.white, fontSize:11, fontWeight:700, letterSpacing:"0.1em",
          fontFamily:"'Inter',sans-serif",
        }}>MOST POPULAR</div>
      )}
      <div style={{marginBottom:20}}>
        <div style={{width:44,height:44,borderRadius:12,background:`${plan.color}22`,border:`1px solid ${plan.color}44`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:plan.color}}/>
        </div>
        <p style={{color:plan.color,fontWeight:700,fontSize:14,margin:"0 0 4px",fontFamily:"'Inter',sans-serif"}}>{plan.name}</p>
        <p style={{color:COLORS.muted,fontSize:12,margin:0,fontFamily:"'Inter',sans-serif"}}>{plan.desc}</p>
      </div>
      <div style={{marginBottom:24}}>
        <span style={{color:COLORS.white,fontWeight:800,fontSize:42,letterSpacing:"-0.03em",fontFamily:"'Inter',sans-serif"}}>${price}</span>
        <span style={{color:COLORS.muted,fontSize:14,fontFamily:"'Inter',sans-serif"}}>/mo{yearly?" (billed annually)":""}</span>
        {yearly && <div style={{color:COLORS.green,fontSize:11,marginTop:4,fontFamily:"'Inter',sans-serif"}}>Save ${(plan.price-plan.priceYear)*12}/year</div>}
      </div>
      <div style={{marginBottom:24,paddingBottom:24,borderBottom:`1px solid ${COLORS.border}`}}>
        <div style={{color:COLORS.muted,fontSize:11,fontWeight:700,letterSpacing:"0.1em",marginBottom:8,fontFamily:"'Inter',sans-serif"}}>INCLUDES</div>
        {plan.features.map(f=>(
          <div key={f} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7}}>
            <span style={{color:COLORS.green,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
            <span style={{color:COLORS.white,fontSize:13,lineHeight:1.5,fontFamily:"'Inter',sans-serif"}}>{f}</span>
          </div>
        ))}
        {plan.notIncluded.map(f=>(
          <div key={f} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7,opacity:0.35}}>
            <span style={{color:COLORS.dim,fontSize:13,flexShrink:0,marginTop:1}}>✕</span>
            <span style={{color:COLORS.muted,fontSize:13,lineHeight:1.5,fontFamily:"'Inter',sans-serif"}}>{f}</span>
          </div>
        ))}
      </div>
      <button style={{
        width:"100%", border:"none", borderRadius:12, padding:"13px 0", cursor:"pointer",
        background: plan.popular ? `linear-gradient(90deg,${COLORS.magenta},#7C3AED)` : `${plan.color}22`,
        color: plan.popular ? COLORS.white : plan.color,
        fontWeight:700, fontSize:14, fontFamily:"'Inter',sans-serif",
        boxShadow: plan.popular ? `0 4px 20px ${COLORS.magenta}44` : "none",
      }}>Start {plan.name} →</button>
    </div>
  );
}

// ── Studio Tool Card ───────────────────────────────────────────
function ToolCard({ tool, active, onClick }) {
  return (
    <button onClick={()=>onClick(tool.id)} style={{
      background: active ? `${COLORS.magenta}18` : COLORS.card,
      border:`1.5px solid ${active ? COLORS.magenta : COLORS.border}`,
      borderRadius:16, padding:"18px 16px", cursor:"pointer", textAlign:"left",
      transition:"all 0.2s",
      boxShadow: active ? `0 0 24px ${COLORS.magenta}22` : "none",
    }}>
      <div style={{fontSize:26,marginBottom:10}}>{tool.icon}</div>
      <p style={{color:COLORS.white,fontWeight:700,fontSize:14,margin:"0 0 5px",fontFamily:"'Inter',sans-serif"}}>{tool.label}</p>
      <p style={{color:COLORS.muted,fontSize:12,margin:0,lineHeight:1.5,fontFamily:"'Inter',sans-serif"}}>{tool.desc}</p>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function RasaAI() {
  // Global state
  const [page, setPage] = useState("landing"); // landing | studio | pricing | dashboard
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [yearlyBilling, setYearlyBilling] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Studio state
  const [activeTool, setActiveTool] = useState("text-image");
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [activeFormat, setActiveFormat] = useState("Post (1:1)");
  const [tone, setTone] = useState("Viral & Trendy");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [resultType, setResultType] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [copied, setCopied] = useState({});
  const [publishStatus, setPublishStatus] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [credits, setCredits] = useState(300);
  const [scheduledAt, setScheduledAt] = useState("");

  // Auth state
  const [authMode, setAuthMode] = useState("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");

  const fileRef = useRef();
  const audioRef = useRef();

  const showToast = useCallback((msg, type="success") => setToast({msg,type}), []);

  // ── Auth ─────────────────────────────────────────────────────
  const handleAuth = useCallback((e) => {
    e?.preventDefault?.();
    if (!authEmail || !authPass) return showToast("Fill in all fields","error");
    const u = { name: authName || authEmail.split("@")[0], email: authEmail, avatar: "👤" };
    setUser(u);
    if (!plan) { setPage("pricing"); showToast(`Welcome to rasa.ai, ${u.name}! Choose your plan.`); }
    else { setPage("studio"); showToast(`Welcome back, ${u.name}!`); }
  }, [authEmail, authPass, authName, plan]);

  // ── Generate ─────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && activeTool !== "image-video" && activeTool !== "audio-video") {
      return showToast("Add a description first", "error");
    }
    if (credits <= 0) return showToast("No credits remaining. Upgrade your plan.", "error");
    setGenerating(true);
    setResult(null);
    setEditMode(false);

    const platformName = PLATFORMS.find(p=>p.id===activePlatform)?.name || "Instagram";

    try {
      let raw, parsed;
      const SYSTEM = `You are rasa.ai's elite AI engine for social media influencers. Generate ultra-precise, platform-native content optimised for virality and engagement. Always respond ONLY with valid JSON — no markdown fences, no preamble, no extra text.`;

      if (activeTool === "text-image") {
        raw = await callClaude(SYSTEM, `Generate ultra-realistic image content for ${platformName} ${activeFormat}.
Tone: ${tone}
Brief: ${prompt}

Return JSON only:
{
  "imagePrompt": "Hyper-detailed photorealistic Midjourney v6/DALL-E 3 prompt, 150+ words, include lighting, camera angle, lens type, color grading, mood, specific visual elements",
  "negativePrompt": "Things to exclude for best quality",
  "caption": "Platform-native caption with perfect emoji placement, 150-220 chars",
  "hashtags": ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10","h11","h12","h13","h14","h15"],
  "hook": "Ultra-compelling 3-second scroll-stopping hook text",
  "cta": "Specific, action-driving CTA",
  "altText": "SEO-rich descriptive alt text",
  "bestTime": "Specific day + time for peak engagement",
  "engagementTips": ["tip1","tip2","tip3","tip4"],
  "colorPalette": ["#hex1","#hex2","#hex3"],
  "contentStyle": "Brief style description for visual reference"
}`);
        parsed = JSON.parse(raw);
        setResultType("image");

      } else if (activeTool === "text-video") {
        raw = await callClaude(SYSTEM, `Generate complete video content for ${platformName} ${activeFormat}.
Tone: ${tone}
Brief: ${prompt}

Return JSON only:
{
  "videoPrompt": "Cinematic Sora/Runway/Pika prompt, 200+ words with camera movements, transitions, pacing, mood, visual style",
  "script": "Complete word-for-word script with [SCENE] markers, timestamps, speaker notes",
  "scenes": [
    {"time":"0:00-0:03","visual":"scene desc","audio":"voiceover text","text_overlay":"on-screen text"},
    {"time":"0:03-0:08","visual":"scene desc","audio":"voiceover text","text_overlay":"on-screen text"},
    {"time":"0:08-0:20","visual":"scene desc","audio":"voiceover text","text_overlay":"on-screen text"},
    {"time":"0:20-0:30","visual":"scene desc","audio":"voiceover text","text_overlay":"on-screen text"}
  ],
  "hook": "First 3-second hook — the scroll-stopper",
  "caption": "Platform-native caption",
  "hashtags": ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10"],
  "duration": "Recommended duration",
  "musicMood": "Describe perfect background music mood/genre",
  "editingStyle": "Cuts, transitions, pacing description",
  "cta": "End-screen CTA"
}`, 1500);
        parsed = JSON.parse(raw);
        setResultType("video");

      } else if (activeTool === "image-video") {
        raw = await callClaude(SYSTEM, `Generate image-to-video animation brief for ${platformName}.
Uploaded image context: ${uploadedFile?.name || "image uploaded"}
Tone: ${tone}
Extra instructions: ${prompt || "Animate naturally"}

Return JSON only:
{
  "animationPrompt": "Detailed Runway Gen-3/Pika animation prompt describing motion, camera movement, particle effects, duration",
  "motionDescription": "Plain English description of how the image will animate",
  "duration": "Recommended duration",
  "scenes": [{"time":"0:00-0:03","motion":"desc"},{"time":"0:03-0:08","motion":"desc"}],
  "caption": "Platform-native caption",
  "hashtags": ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10"],
  "musicMood": "Background music suggestion",
  "hook": "Hook text overlay for first frame",
  "cta": "End CTA"
}`);
        parsed = JSON.parse(raw);
        setResultType("image-video");

      } else if (activeTool === "audio-video") {
        raw = await callClaude(SYSTEM, `Generate audio-to-video visual brief for ${platformName}.
Audio file: ${uploadedAudio?.name || "audio uploaded"}
Tone: ${tone}
Brief: ${prompt || "Create visuals that match the audio"}

Return JSON only:
{
  "visualPrompt": "Detailed video generation prompt synced to audio mood and beats",
  "visualConcept": "Overall visual concept and aesthetic",
  "scenes": [
    {"timestamp":"0:00","visual":"opening scene","mood":"mood desc"},
    {"timestamp":"0:05","visual":"scene","mood":"mood desc"},
    {"timestamp":"0:15","visual":"climax scene","mood":"mood desc"},
    {"timestamp":"0:25","visual":"outro scene","mood":"mood desc"}
  ],
  "colorGrading": "Color grading and filter description",
  "typography": "On-screen text style and placement",
  "caption": "Caption",
  "hashtags": ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10"],
  "hook": "Hook text",
  "cta": "CTA"
}`);
        parsed = JSON.parse(raw);
        setResultType("audio-video");

      } else if (activeTool === "caption") {
        raw = await callClaude(SYSTEM, `Generate complete caption package for ${platformName} ${activeFormat}.
Tone: ${tone}
Content brief: ${prompt}

Return JSON only:
{
  "captions": [
    {"version":"Hook-first","text":"full caption version 1","charCount":0},
    {"version":"Story-driven","text":"full caption version 2","charCount":0},
    {"version":"Punchy & Short","text":"full caption version 3","charCount":0}
  ],
  "hashtags": {
    "niche": ["tag1","tag2","tag3","tag4","tag5"],
    "broad": ["tag1","tag2","tag3","tag4","tag5"],
    "trending": ["tag1","tag2","tag3","tag4","tag5"]
  },
  "hook": "Best scroll-stopping opening line",
  "cta": "Best CTA",
  "emojiStrategy": "How and where to use emojis effectively",
  "bestTime": "Best posting time",
  "engagementTips": ["tip1","tip2","tip3","tip4","tip5"]
}`, 1500);
        parsed = JSON.parse(raw);
        setResultType("caption");

      } else if (activeTool === "resize") {
        raw = await callClaude(SYSTEM, `Generate smart resize and reformat guide for content across all platforms.
Original format: ${activeFormat} for ${platformName}
Tone: ${tone}
Content: ${prompt}

Return JSON only:
{
  "resizeGuide": [
    {"platform":"Instagram Post","dimensions":"1080x1080","cropFocus":"center","adjustments":"desc"},
    {"platform":"Instagram Story","dimensions":"1080x1920","cropFocus":"top-center","adjustments":"desc"},
    {"platform":"YouTube Thumbnail","dimensions":"1280x720","cropFocus":"rule-of-thirds","adjustments":"desc"},
    {"platform":"TikTok","dimensions":"1080x1920","cropFocus":"center","adjustments":"desc"},
    {"platform":"Facebook Post","dimensions":"1200x630","cropFocus":"center","adjustments":"desc"},
    {"platform":"Twitter Card","dimensions":"1200x628","cropFocus":"center","adjustments":"desc"},
    {"platform":"LinkedIn","dimensions":"1200x627","cropFocus":"center","adjustments":"desc"}
  ],
  "masterCaption": "Adaptable caption for all platforms",
  "platformCaptions": {"instagram":"","youtube":"","tiktok":"","facebook":"","twitter":"","linkedin":""},
  "hashtagSets": {"instagram":["t1","t2","t3"],"youtube":["t1","t2","t3"],"tiktok":["t1","t2","t3"]},
  "repurposeTips": ["tip1","tip2","tip3"]
}`);
        parsed = JSON.parse(raw);
        setResultType("resize");
      }

      setResult(parsed);
      setCredits(c => c - 1);
      setHistory(h => [{ id: Date.now(), tool: activeTool, platform: activePlatform, format: activeFormat, prompt, result: parsed, type: resultType || activeTool }, ...h].slice(0,50));
      showToast("Content generated successfully!");
    } catch (err) {
      showToast("Generation failed. Check your connection.", "error");
    } finally {
      setGenerating(false);
    }
  }, [prompt, activeTool, activePlatform, activeFormat, tone, credits, uploadedFile, uploadedAudio]);

  const copyText = useCallback((key, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(c => ({ ...c, [key]: true }));
    setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000);
    showToast("Copied to clipboard!");
  }, []);

  const handlePublish = useCallback((platformId) => {
    setPublishStatus(s => ({ ...s, [platformId]: "publishing" }));
    setTimeout(() => {
      setPublishStatus(s => ({ ...s, [platformId]: "done" }));
      showToast(`Published to ${PLATFORMS.find(p=>p.id===platformId)?.name}!`);
    }, 2200);
  }, []);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rasa-ai-${activeTool}-${Date.now()}.json`;
    a.click();
    showToast("Content package downloaded!");
  }, [result, activeTool]);

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.white, fontFamily:"'Inter',system-ui,sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::selection { background:${COLORS.magenta}44; color:#fff; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:${COLORS.bg}; } ::-webkit-scrollbar-thumb { background:${COLORS.dim}; border-radius:3px; }
        @keyframes orbPulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes orbSpin { to{stroke-dashoffset:-100} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px ${COLORS.magenta}33} 50%{box-shadow:0 0 40px ${COLORS.magenta}66} }
        input,textarea,select { background:${COLORS.surface}; border:1px solid ${COLORS.border}; border-radius:10px; padding:12px 14px; color:${COLORS.white}; font-family:'Inter',sans-serif; font-size:14px; width:100%; }
        input:focus,textarea:focus,select:focus { outline:none; border-color:${COLORS.magenta}; box-shadow:0 0 0 3px ${COLORS.magenta}18; }
        button { font-family:'Inter',sans-serif; cursor:pointer; border:none; }
        a { color:inherit; text-decoration:none; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background:`${COLORS.bg}ee`, backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${COLORS.border}`,
        padding:"0 24px",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={()=>setPage("landing")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", color:COLORS.white }}>
            <RasaLogo size={34}/>
            <span style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.02em" }}>rasa<span style={{ color:COLORS.magenta }}>.ai</span></span>
          </button>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {user ? (
              <>
                <button onClick={()=>setPage("studio")} style={{ padding:"8px 18px", borderRadius:999, background: page==="studio"?`${COLORS.magenta}22`:"transparent", color: page==="studio"?COLORS.magenta:COLORS.muted, fontWeight:600, fontSize:13 }}>Studio</button>
                <button onClick={()=>setPage("dashboard")} style={{ padding:"8px 18px", borderRadius:999, background: page==="dashboard"?`${COLORS.magenta}22`:"transparent", color: page==="dashboard"?COLORS.magenta:COLORS.muted, fontWeight:600, fontSize:13 }}>Dashboard</button>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:COLORS.card, borderRadius:999, border:`1px solid ${COLORS.border}` }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${COLORS.magenta},#7C3AED)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ color:COLORS.white, fontSize:13, fontWeight:600 }}>{user.name}</span>
                  <span style={{ color:COLORS.magenta, fontSize:11, fontWeight:700 }}>{credits}cr</span>
                </div>
                <button onClick={()=>{setUser(null);setPlan(null);setPage("landing");}} style={{ padding:"8px 14px", borderRadius:999, background:"transparent", color:COLORS.muted, fontSize:13 }}>Sign out</button>
              </>
            ) : (
              <>
                <button onClick={()=>setPage("pricing")} style={{ padding:"8px 18px", borderRadius:999, background:"transparent", color:COLORS.muted, fontWeight:600, fontSize:13 }}>Pricing</button>
                <button onClick={()=>{setAuthMode("login");setPage("auth");}} style={{ padding:"9px 20px", borderRadius:999, background:"transparent", color:COLORS.white, fontWeight:600, fontSize:13, border:`1px solid ${COLORS.border}` }}>Sign in</button>
                <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{ padding:"9px 22px", borderRadius:999, background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`, color:COLORS.white, fontWeight:700, fontSize:13, boxShadow:`0 4px 16px ${COLORS.magenta}44` }}>Start free →</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════════════════════ LANDING PAGE ══════════════════════════ */}
      {page === "landing" && (
        <div>
          {/* Hero */}
          <section data-orb-zone="true" style={{ minHeight:"92vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 24px", position:"relative", overflow:"hidden" }}>
            {/* BG grid */}
            <div style={{ position:"absolute",inset:0, backgroundImage:`linear-gradient(${COLORS.border}44 1px,transparent 1px),linear-gradient(90deg,${COLORS.border}44 1px,transparent 1px)`, backgroundSize:"60px 60px", opacity:0.3 }}/>
            <div style={{ position:"absolute",inset:0, background:`radial-gradient(ellipse 80% 60% at 50% 50%,${COLORS.magenta}08 0%,transparent 70%)` }}/>

            <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", gap:60, flexWrap:"wrap", justifyContent:"center", position:"relative", zIndex:1 }}>
              <div style={{ flex:"1 1 480px", animation:"fadeUp 0.8s ease" }}>
                <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:`${COLORS.magenta}18`,border:`1px solid ${COLORS.magenta}40`,borderRadius:999,padding:"6px 16px",marginBottom:24 }}>
                  <div style={{ width:6,height:6,borderRadius:3,background:COLORS.magenta,animation:"pulse 1.5s infinite" }}/>
                  <span style={{ color:COLORS.magenta,fontSize:11,fontWeight:700,letterSpacing:"0.12em" }}>BUILT FOR INFLUENCERS</span>
                </div>
                <h1 style={{ fontSize:"clamp(36px,5.5vw,68px)", fontWeight:900, lineHeight:1.08, letterSpacing:"-0.03em", marginBottom:22 }}>
                  Create content that{" "}
                  <span style={{ background:`linear-gradient(90deg,${COLORS.magenta},${COLORS.cyan})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"200%", animation:"shimmer 3s linear infinite" }}>
                    actually goes viral.
                  </span>
                </h1>
                <p style={{ color:COLORS.muted, fontSize:"clamp(15px,2vw,18px)", lineHeight:1.7, marginBottom:36, maxWidth:500 }}>
                  rasa.ai is the all-in-one AI studio for social media creators. Generate images, videos, captions — publish everywhere. No design skills needed.
                </p>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:40 }}>
                  <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{ padding:"15px 32px", borderRadius:12, background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`, color:COLORS.white, fontWeight:800, fontSize:16, boxShadow:`0 6px 30px ${COLORS.magenta}44`, letterSpacing:"-0.01em" }}>Start creating free →</button>
                  <button onClick={()=>setPage("pricing")} style={{ padding:"15px 28px", borderRadius:12, background:"transparent", color:COLORS.white, fontWeight:700, fontSize:15, border:`1px solid ${COLORS.border}` }}>See pricing</button>
                </div>
                <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
                  {[["50K+","Creators"],["12M+","Posts made"],["6","Platforms"]].map(([n,l])=>(
                    <div key={l}>
                      <div style={{ color:COLORS.white, fontWeight:800, fontSize:22, letterSpacing:"-0.02em" }}>{n}</div>
                      <div style={{ color:COLORS.muted, fontSize:12 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flexShrink:0, animation:"fadeUp 1s ease 0.2s both" }}>
                <MorphOrb size={300} interactive={true}/>
              </div>
            </div>
          </section>

          {/* Features */}
          <section style={{ padding:"100px 24px", background:COLORS.surface }}>
            <div style={{ maxWidth:1100, margin:"0 auto" }}>
              <SectionHead eyebrow="CAPABILITIES" title="Everything a creator needs." sub="From concept to published post — rasa.ai handles image generation, video production, captions, scheduling and publishing across every major platform."/>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
                {[
                  { icon:"🎨", title:"Text → Image", desc:"Photorealistic images from a sentence. Optimised for every platform format." },
                  { icon:"🎬", title:"Text → Video", desc:"Turn scripts into cinematic reels, shorts, and YouTube videos automatically." },
                  { icon:"✨", title:"Image → Video", desc:"Breathe life into your photos — animate them into stunning video content." },
                  { icon:"🎙️", title:"Audio → Video", desc:"Upload a voiceover or track and get a fully synced visual video." },
                  { icon:"✍️", title:"AI Captions", desc:"3 caption variants per post with full hashtag strategy and optimal posting times." },
                  { icon:"📐", title:"Smart Resize", desc:"One piece of content, reformatted for every platform in seconds." },
                  { icon:"🚀", title:"Direct Publish", desc:"Publish to Instagram, YouTube, TikTok, Facebook, Twitter and LinkedIn without leaving rasa.ai." },
                  { icon:"📅", title:"Content Scheduler", desc:"Plan your entire content calendar weeks in advance with AI-suggested timing." },
                  { icon:"📊", title:"Analytics", desc:"Track reach, engagement, and follower growth across all platforms in one dashboard." },
                ].map(f=>(
                  <div key={f.title} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:"24px 22px" }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
                    <p style={{ fontWeight:700, fontSize:15, marginBottom:7, color:COLORS.white }}>{f.title}</p>
                    <p style={{ color:COLORS.muted, fontSize:13, lineHeight:1.6 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Platforms */}
          <section style={{ padding:"80px 24px" }}>
            <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
              <SectionHead eyebrow="PUBLISH EVERYWHERE" title="One click. Six platforms." sub="Create once, publish everywhere. rasa.ai knows the optimal format, size, and caption length for each platform."/>
              <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
                {PLATFORMS.map(p=>(
                  <div key={p.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"20px 24px", background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, minWidth:100 }}>
                    <div style={{ fontSize:28 }}>{p.icon}</div>
                    <span style={{ color:COLORS.white, fontWeight:600, fontSize:12 }}>{p.name}</span>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:p.color }}/>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Social proof */}
          <section style={{ padding:"80px 24px", background:COLORS.surface }}>
            <div style={{ maxWidth:1100, margin:"0 auto" }}>
              <SectionHead eyebrow="CREATORS LOVE RASA" title="Built by creators, for creators."/>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
                {[
                  { name:"@sophiamakes",  followers:"2.1M", platform:"Instagram", quote:"rasa.ai cut my content creation time by 80%. My engagement went up 3x in the first month.", avatar:"🌸" },
                  { name:"@techwithjay",  followers:"890K",  platform:"YouTube",   quote:"The video script generator is insane. It writes better hooks than I do after 5 years on YouTube.", avatar:"⚡" },
                  { name:"@luxebylena",   followers:"1.4M", platform:"TikTok",    quote:"I went from posting twice a week to daily content. The AI understands my brand voice perfectly.", avatar:"✨" },
                ].map(r=>(
                  <div key={r.name} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:"26px 24px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                      <div style={{ width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${COLORS.magenta},#7C3AED)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{r.avatar}</div>
                      <div>
                        <p style={{ color:COLORS.white, fontWeight:700, fontSize:14 }}>{r.name}</p>
                        <p style={{ color:COLORS.muted, fontSize:12 }}>{r.followers} followers · {r.platform}</p>
                      </div>
                    </div>
                    <p style={{ color:COLORS.white, fontSize:14, lineHeight:1.65, opacity:0.9, fontStyle:"italic" }}>"{r.quote}"</p>
                    <div style={{ display:"flex", gap:2, marginTop:14 }}>
                      {[...Array(5)].map((_,i)=><span key={i} style={{ color:COLORS.gold, fontSize:14 }}>★</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section style={{ padding:"100px 24px", textAlign:"center" }}>
            <div style={{ maxWidth:600, margin:"0 auto" }}>
              <h2 style={{ fontSize:"clamp(30px,5vw,52px)", fontWeight:900, marginBottom:20, letterSpacing:"-0.03em" }}>
                Start creating in{" "}
                <span style={{ color:COLORS.magenta }}>30 seconds.</span>
              </h2>
              <p style={{ color:COLORS.muted, fontSize:17, marginBottom:36, lineHeight:1.6 }}>No credit card required. 50 free credits on signup. Cancel anytime.</p>
              <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{ padding:"17px 44px", borderRadius:14, background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`, color:COLORS.white, fontWeight:800, fontSize:17, boxShadow:`0 8px 40px ${COLORS.magenta}44`, letterSpacing:"-0.01em" }}>
                Create your free account →
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ borderTop:`1px solid ${COLORS.border}`, padding:"32px 24px" }}>
            <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <RasaLogo size={26}/>
                <span style={{ fontWeight:700, color:COLORS.white }}>rasa<span style={{color:COLORS.magenta}}>.ai</span></span>
              </div>
              <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                {["Privacy","Terms","Blog","Support","API Docs"].map(l=>(
                  <span key={l} style={{ color:COLORS.muted, fontSize:13, cursor:"pointer" }}>{l}</span>
                ))}
              </div>
              <span style={{ color:COLORS.dim, fontSize:12 }}>© 2025 rasa.ai · All rights reserved</span>
            </div>
          </footer>
        </div>
      )}

      {/* ══════════════════════════ AUTH PAGE ══════════════════════════ */}
      {page === "auth" && (
        <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.4s ease" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <RasaLogo size={48}/>
              <h2 style={{ fontSize:28, fontWeight:800, marginTop:16, marginBottom:6 }}>
                {authMode === "signup" ? "Start creating for free" : "Welcome back"}
              </h2>
              <p style={{ color:COLORS.muted, fontSize:14 }}>
                {authMode === "signup" ? "50 free credits. No card needed." : "Sign in to your rasa.ai account"}
              </p>
            </div>
            <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:20, padding:32 }}>
              {authMode === "signup" && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ color:COLORS.muted, fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>YOUR NAME</label>
                  <input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="e.g. Sofia Reyes" />
                </div>
              )}
              <div style={{ marginBottom:14 }}>
                <label style={{ color:COLORS.muted, fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>EMAIL</label>
                <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ color:COLORS.muted, fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>PASSWORD</label>
                <input type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleAuth()} />
              </div>
              <button onClick={handleAuth} style={{ width:"100%", padding:"14px 0", borderRadius:12, background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`, color:COLORS.white, fontWeight:800, fontSize:15, boxShadow:`0 4px 20px ${COLORS.magenta}44` }}>
                {authMode === "signup" ? "Create account →" : "Sign in →"}
              </button>
              {authMode === "signup" && (
                <p style={{ color:COLORS.dim, fontSize:11, textAlign:"center", marginTop:14, lineHeight:1.6 }}>
                  By creating an account you agree to our Terms of Service and Privacy Policy.
                </p>
              )}
              <div style={{ textAlign:"center", marginTop:20 }}>
                <span style={{ color:COLORS.muted, fontSize:13 }}>
                  {authMode === "signup" ? "Already have an account? " : "New to rasa.ai? "}
                </span>
                <button onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")} style={{ background:"none", color:COLORS.magenta, fontWeight:700, fontSize:13 }}>
                  {authMode === "signup" ? "Sign in" : "Create account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ PRICING PAGE ══════════════════════════ */}
      {page === "pricing" && (
        <div style={{ padding:"80px 24px 100px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <SectionHead eyebrow="PRICING" title="Simple, transparent pricing." sub="Start free. Upgrade when you're ready. All plans include a 7-day money-back guarantee."/>
            {/* Toggle */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:14, marginBottom:48 }}>
              <span style={{ color: yearlyBilling?COLORS.muted:COLORS.white, fontWeight:600, fontSize:14 }}>Monthly</span>
              <button onClick={()=>setYearlyBilling(y=>!y)} style={{ width:52, height:28, borderRadius:14, background: yearlyBilling?COLORS.magenta:COLORS.card, border:`1px solid ${COLORS.border}`, position:"relative", transition:"background 0.2s" }}>
                <div style={{ position:"absolute", top:4, left: yearlyBilling?26:4, width:18, height:18, borderRadius:"50%", background:COLORS.white, transition:"left 0.2s" }}/>
              </button>
              <span style={{ color: yearlyBilling?COLORS.white:COLORS.muted, fontWeight:600, fontSize:14 }}>Yearly <span style={{ color:COLORS.green, fontSize:12 }}>Save 20%</span></span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
              {PLANS.map(p=><PricingCard key={p.name} plan={p} yearly={yearlyBilling} onSelect={pl=>{setPlan(pl);user?setPage("studio"):setPage("auth");showToast(`${pl.name} plan selected!`);}} active={plan?.name}/>)}
            </div>
            <div style={{ textAlign:"center", marginTop:48 }}>
              <p style={{ color:COLORS.muted, fontSize:14, marginBottom:16 }}>All plans include: SSL security · GDPR compliant · 99.9% uptime SLA · Cancel anytime</p>
              <div style={{ display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap" }}>
                {["💳 Secure payments via Stripe","🔒 Bank-level encryption","📧 Cancel any time","🎯 7-day money back"].map(t=>(
                  <span key={t} style={{ color:COLORS.muted, fontSize:13 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ STUDIO PAGE ══════════════════════════ */}
      {page === "studio" && user && (
        <div style={{ display:"flex", height:"calc(100vh - 64px)", overflow:"hidden" }}>
          {/* Left sidebar */}
          <div style={{ width:220, background:COLORS.surface, borderRight:`1px solid ${COLORS.border}`, padding:"16px 12px", overflowY:"auto", flexShrink:0 }}>
            {/* Credits */}
            <div style={{ background:COLORS.card, borderRadius:12, padding:"12px 14px", marginBottom:16, border:`1px solid ${COLORS.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:COLORS.muted, fontSize:11, fontWeight:700 }}>CREDITS</span>
                <span style={{ color:COLORS.magenta, fontSize:11, fontWeight:700 }}>{plan?.name || "Free"}</span>
              </div>
              <div style={{ color:COLORS.white, fontWeight:800, fontSize:22, marginBottom:6 }}>{credits}</div>
              <div style={{ height:4, background:COLORS.border, borderRadius:2 }}>
                <div style={{ height:"100%", borderRadius:2, background:`linear-gradient(90deg,${COLORS.magenta},${COLORS.cyan})`, width:`${Math.min((credits/(plan?.credits||50))*100,100)}%`, transition:"width 0.4s" }}/>
              </div>
              {!plan && <button onClick={()=>setPage("pricing")} style={{ width:"100%", marginTop:10, padding:"8px 0", borderRadius:8, background:`${COLORS.magenta}22`, color:COLORS.magenta, fontWeight:700, fontSize:11, border:`1px solid ${COLORS.magenta}44` }}>Upgrade →</button>}
            </div>
            {/* Tools */}
            <p style={{ color:COLORS.dim, fontSize:10, fontWeight:700, letterSpacing:"0.12em", marginBottom:8, paddingLeft:4 }}>AI TOOLS</p>
            {STUDIO_TOOLS.map(t=>(
              <button key={t.id} onClick={()=>{setActiveTool(t.id);setResult(null);}} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 12px", borderRadius:10, marginBottom:4, background: activeTool===t.id?`${COLORS.magenta}18`:"transparent", color: activeTool===t.id?COLORS.magenta:COLORS.muted, fontWeight: activeTool===t.id?700:500, fontSize:13, textAlign:"left", border: activeTool===t.id?`1px solid ${COLORS.magenta}44`:"1px solid transparent", transition:"all 0.15s" }}>
                <span style={{fontSize:16}}>{t.icon}</span> {t.label}
              </button>
            ))}
            {/* History */}
            {history.length > 0 && (
              <>
                <div style={{ borderTop:`1px solid ${COLORS.border}`, margin:"16px 0 12px" }}/>
                <p style={{ color:COLORS.dim, fontSize:10, fontWeight:700, letterSpacing:"0.12em", marginBottom:8, paddingLeft:4 }}>RECENT</p>
                {history.slice(0,5).map(h=>(
                  <button key={h.id} onClick={()=>{setResult(h.result);setResultType(h.type);setActiveTool(h.tool);setPrompt(h.prompt);}} style={{ width:"100%", padding:"8px 12px", borderRadius:8, marginBottom:3, background:"transparent", color:COLORS.muted, fontSize:11, textAlign:"left", lineHeight:1.4, border:"none" }}>
                    <span style={{marginRight:6}}>{STUDIO_TOOLS.find(t=>t.id===h.tool)?.icon||"✨"}</span>
                    {h.prompt.slice(0,32)}{h.prompt.length>32?"…":""}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Main content */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* Top toolbar */}
            <div style={{ padding:"12px 20px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", background:COLORS.surface }}>
              {/* Platform */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {PLATFORMS.map(p=>(
                  <button key={p.id} onClick={()=>{setActivePlatform(p.id);setActiveFormat(FORMATS[p.id][0]);}} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, background: activePlatform===p.id?`${p.color}22`:"transparent", color: activePlatform===p.id?p.color:COLORS.muted, border: activePlatform===p.id?`1px solid ${p.color}55`:`1px solid transparent`, transition:"all 0.15s" }}>
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
              <div style={{ width:1, height:24, background:COLORS.border, margin:"0 4px" }}/>
              {/* Format */}
              <select value={activeFormat} onChange={e=>setActiveFormat(e.target.value)} style={{ width:"auto", padding:"6px 10px", fontSize:12, borderRadius:8 }}>
                {(FORMATS[activePlatform]||[]).map(f=><option key={f}>{f}</option>)}
              </select>
              {/* Tone */}
              <select value={tone} onChange={e=>setTone(e.target.value)} style={{ width:"auto", padding:"6px 10px", fontSize:12, borderRadius:8 }}>
                {TONES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Main area split */}
            <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
              {/* Input panel */}
              <div style={{ width:360, borderRight:`1px solid ${COLORS.border}`, padding:20, overflowY:"auto", flexShrink:0 }}>
                <p style={{ color:COLORS.white, fontWeight:700, fontSize:15, marginBottom:14 }}>
                  {STUDIO_TOOLS.find(t=>t.id===activeTool)?.icon} {STUDIO_TOOLS.find(t=>t.id===activeTool)?.label}
                </p>
                <p style={{ color:COLORS.muted, fontSize:12, lineHeight:1.6, marginBottom:18 }}>
                  {STUDIO_TOOLS.find(t=>t.id===activeTool)?.desc}
                </p>

                {/* Upload zone for image→video */}
                {(activeTool === "image-video") && (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={e=>setUploadedFile(e.target.files[0])} style={{ display:"none" }}/>
                    <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${uploadedFile?COLORS.magenta:COLORS.border}`, borderRadius:12, padding:"24px 16px", textAlign:"center", cursor:"pointer", marginBottom:14, background: uploadedFile?`${COLORS.magenta}08`:"transparent", transition:"all 0.2s" }}>
                      {uploadedFile ? (
                        <>
                          <div style={{ fontSize:24, marginBottom:6 }}>🖼️</div>
                          <p style={{ color:COLORS.magenta, fontWeight:600, fontSize:13 }}>{uploadedFile.name}</p>
                          <p style={{ color:COLORS.muted, fontSize:11, marginTop:4 }}>Click to change image</p>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize:28, marginBottom:8 }}>📁</div>
                          <p style={{ color:COLORS.muted, fontSize:13, fontWeight:600 }}>Upload your image</p>
                          <p style={{ color:COLORS.dim, fontSize:11, marginTop:4 }}>PNG, JPG, WEBP up to 20MB</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload zone for audio→video */}
                {activeTool === "audio-video" && (
                  <div>
                    <input ref={audioRef} type="file" accept="audio/*" onChange={e=>setUploadedAudio(e.target.files[0])} style={{ display:"none" }}/>
                    <div onClick={()=>audioRef.current?.click()} style={{ border:`2px dashed ${uploadedAudio?COLORS.cyan:COLORS.border}`, borderRadius:12, padding:"24px 16px", textAlign:"center", cursor:"pointer", marginBottom:14, background: uploadedAudio?`${COLORS.cyan}08`:"transparent", transition:"all 0.2s" }}>
                      {uploadedAudio ? (
                        <>
                          <div style={{ fontSize:24, marginBottom:6 }}>🎵</div>
                          <p style={{ color:COLORS.cyan, fontWeight:600, fontSize:13 }}>{uploadedAudio.name}</p>
                          <p style={{ color:COLORS.muted, fontSize:11, marginTop:4 }}>Click to change audio</p>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize:28, marginBottom:8 }}>🎙️</div>
                          <p style={{ color:COLORS.muted, fontSize:13, fontWeight:600 }}>Upload audio / voiceover</p>
                          <p style={{ color:COLORS.dim, fontSize:11, marginTop:4 }}>MP3, WAV, M4A up to 50MB</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Prompt */}
                <label style={{ color:COLORS.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:6, letterSpacing:"0.08em" }}>
                  {activeTool === "image-video" ? "ANIMATION INSTRUCTIONS (OPTIONAL)" : activeTool === "audio-video" ? "VISUAL STYLE BRIEF (OPTIONAL)" : "YOUR BRIEF"}
                </label>
                <textarea
                  value={prompt} onChange={e=>setPrompt(e.target.value)}
                  placeholder={
                    activeTool === "text-image" ? "e.g. A luxury fashion influencer in a Parisian café, golden hour, editorial style, wearing a silk dress, soft bokeh background..." :
                    activeTool === "text-video" ? "e.g. A 30-second reel about my skincare morning routine. Aesthetic, slow-motion, voice-over style..." :
                    activeTool === "image-video" ? "e.g. Zoom in slowly, add floating particles, dreamy atmosphere..." :
                    activeTool === "audio-video" ? "e.g. Abstract visuals, futuristic, matching the energy and beats of the track..." :
                    activeTool === "caption" ? "e.g. Just posted my new YouTube video about sustainable fashion hauls. Want something that drives clicks..." :
                    "e.g. A travel photo from Bali. Needs to be resized for all my platforms..."
                  }
                  style={{ minHeight:130, resize:"vertical", lineHeight:1.6, marginBottom:14 }}
                  onKeyDown={e=>e.key==="Enter"&&e.metaKey&&handleGenerate()}
                />

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    width:"100%", padding:"14px 0", borderRadius:12,
                    background: generating ? COLORS.card : `linear-gradient(90deg,${COLORS.magenta},#7C3AED)`,
                    color: generating ? COLORS.dim : COLORS.white,
                    fontWeight:800, fontSize:14, letterSpacing:"-0.01em",
                    boxShadow: generating ? "none" : `0 4px 20px ${COLORS.magenta}44`,
                    transition:"all 0.2s",
                  }}>
                  {generating ? (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <span style={{ display:"inline-block", width:14, height:14, border:`2px solid ${COLORS.dim}`, borderTopColor:COLORS.muted, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                      Generating…
                    </span>
                  ) : `⚡ Generate — 1 credit`}
                </button>
                <p style={{ color:COLORS.dim, fontSize:11, textAlign:"center", marginTop:8 }}>⌘+Enter to generate · {credits} credits left</p>

                {/* Schedule */}
                {result && (
                  <div style={{ marginTop:20 }}>
                    <label style={{ color:COLORS.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:6 }}>SCHEDULE POST</label>
                    <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} style={{ marginBottom:8 }}/>
                    <button onClick={()=>{if(scheduledAt)showToast("Post scheduled!");}} style={{ width:"100%", padding:"10px 0", borderRadius:10, background:`${COLORS.cyan}22`, color:COLORS.cyan, fontWeight:700, fontSize:13, border:`1px solid ${COLORS.cyan}44` }}>
                      📅 Schedule
                    </button>
                  </div>
                )}
              </div>

              {/* Result panel */}
              <div style={{ flex:1, overflowY:"auto", padding:20 }}>
                {!result && !generating && (
                  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, opacity:0.5 }}>
                    <div style={{ fontSize:52 }}>{STUDIO_TOOLS.find(t=>t.id===activeTool)?.icon || "✨"}</div>
                    <p style={{ color:COLORS.muted, fontSize:15, fontWeight:600 }}>Your content appears here</p>
                    <p style={{ color:COLORS.dim, fontSize:13 }}>Fill in the brief on the left and hit Generate</p>
                  </div>
                )}

                {generating && (
                  <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
                    <MorphOrb size={180} interactive={false}/>
                    <p style={{ color:COLORS.muted, fontSize:14 }}>rasa.ai is crafting your content…</p>
                    <div style={{ display:"flex", gap:6 }}>
                      {[0,0.15,0.3].map((d,i)=>(
                        <div key={i} style={{ width:8,height:8,borderRadius:"50%",background:COLORS.magenta,animation:`pulse 1s ${d}s ease-in-out infinite` }}/>
                      ))}
                    </div>
                  </div>
                )}

                {result && !generating && (
                  <div style={{ animation:"fadeUp 0.4s ease" }}>
                    {/* Action bar */}
                    <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
                      <button onClick={downloadResult} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,background:COLORS.card,border:`1px solid ${COLORS.border}`,color:COLORS.white,fontWeight:600,fontSize:12 }}>
                        ⬇️ Download Package
                      </button>
                      <button onClick={()=>{setEditMode(e=>!e);setEditedCaption(result.caption||"");}} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,background: editMode?`${COLORS.magenta}22`:COLORS.card,border:`1px solid ${editMode?COLORS.magenta:COLORS.border}`,color: editMode?COLORS.magenta:COLORS.white,fontWeight:600,fontSize:12 }}>
                        ✏️ {editMode ? "Done editing" : "Edit"}
                      </button>
                      {result.caption && <button onClick={()=>copyText("cap",result.caption)} style={{ padding:"8px 16px",borderRadius:8,background: copied.cap?`${COLORS.green}22`:COLORS.card,border:`1px solid ${copied.cap?COLORS.green:COLORS.border}`,color: copied.cap?COLORS.green:COLORS.white,fontWeight:600,fontSize:12 }}>
                        {copied.cap?"✓ Copied":"📋 Copy caption"}
                      </button>}
                    </div>

                    {/* Publish bar */}
                    <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:"14px 16px", marginBottom:18 }}>
                      <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:10 }}>PUBLISH TO</p>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {PLATFORMS.map(p=>{
                          const st = publishStatus[p.id];
                          return (
                            <button key={p.id} onClick={()=>handlePublish(p.id)} disabled={st==="done"} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,border:"none",background: st==="done"?`${COLORS.green}22`:st==="publishing"?COLORS.surface:`${p.color}22`,color: st==="done"?COLORS.green:st==="publishing"?COLORS.muted:p.color,fontWeight:600,fontSize:12,transition:"all 0.2s" }}>
                              {st==="publishing" ? <span style={{display:"inline-block",width:10,height:10,border:`2px solid ${COLORS.dim}`,borderTopColor:COLORS.muted,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> : p.icon}
                              {st==="done" ? "Published" : st==="publishing" ? "Publishing…" : p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* IMAGE RESULT */}
                    {(resultType === "image") && result && (
                      <div style={{ display:"grid", gap:14, gridTemplateColumns:"1fr 1fr" }}>
                        {/* Image prompt */}
                        <div style={{ gridColumn:"1/-1", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>🎨 AI IMAGE PROMPT</p>
                            <button onClick={()=>copyText("imgp",result.imagePrompt)} style={{ padding:"4px 10px",borderRadius:6,background: copied.imgp?`${COLORS.green}22`:COLORS.surface,border:`1px solid ${copied.imgp?COLORS.green:COLORS.border}`,color: copied.imgp?COLORS.green:COLORS.muted,fontSize:11,fontWeight:600 }}>{copied.imgp?"✓ Copied":"Copy"}</button>
                          </div>
                          <p style={{ color:COLORS.white, fontSize:13, lineHeight:1.7 }}>{result.imagePrompt}</p>
                          {result.negativePrompt && <p style={{ color:COLORS.dim, fontSize:12, marginTop:10, fontStyle:"italic" }}>Negative: {result.negativePrompt}</p>}
                          {result.contentStyle && <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                            {result.colorPalette?.map(c=><div key={c} style={{ width:24,height:24,borderRadius:6,background:c,border:`1px solid ${COLORS.border}` }} title={c}/>)}
                            <span style={{ color:COLORS.muted, fontSize:12, alignSelf:"center" }}>{result.contentStyle}</span>
                          </div>}
                        </div>
                        {/* Caption */}
                        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>✍️ CAPTION</p>
                            <button onClick={()=>copyText("cap2",result.caption)} style={{ padding:"4px 10px",borderRadius:6,background: copied.cap2?`${COLORS.green}22`:COLORS.surface,border:`1px solid ${copied.cap2?COLORS.green:COLORS.border}`,color: copied.cap2?COLORS.green:COLORS.muted,fontSize:11,fontWeight:600 }}>{copied.cap2?"✓":"Copy"}</button>
                          </div>
                          {editMode ? (
                            <textarea value={editedCaption} onChange={e=>{setEditedCaption(e.target.value);setResult(r=>({...r,caption:e.target.value}));}} style={{ width:"100%", minHeight:100, fontSize:13, lineHeight:1.6, resize:"vertical" }}/>
                          ) : (
                            <p style={{ color:COLORS.white, fontSize:13, lineHeight:1.7 }}>{result.caption}</p>
                          )}
                        </div>
                        {/* Hook */}
                        <div style={{ background:`${COLORS.gold}0D`, border:`1px solid ${COLORS.gold}44`, borderRadius:14, padding:18 }}>
                          <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:10 }}>⚡ HOOK — FIRST 3 SECONDS</p>
                          <p style={{ color:COLORS.goldLight, fontWeight:700, fontSize:15, lineHeight:1.5 }}>"{result.hook}"</p>
                          <p style={{ color:COLORS.muted, fontSize:12, marginTop:10 }}>CTA: <span style={{ color:COLORS.cyan }}>{result.cta}</span></p>
                          <p style={{ color:COLORS.muted, fontSize:12, marginTop:6 }}>Best time: <span style={{ color:COLORS.white }}>{result.bestTime}</span></p>
                        </div>
                        {/* Hashtags */}
                        <div style={{ gridColumn:"1/-1", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}># HASHTAGS ({result.hashtags?.length})</p>
                            <button onClick={()=>copyText("hash",result.hashtags?.map(h=>`#${h.replace(/^#/,"")}`).join(" "))} style={{ padding:"4px 10px",borderRadius:6,background: copied.hash?`${COLORS.green}22`:COLORS.surface,border:`1px solid ${copied.hash?COLORS.green:COLORS.border}`,color: copied.hash?COLORS.green:COLORS.muted,fontSize:11,fontWeight:600 }}>{copied.hash?"✓ Copied":"Copy all"}</button>
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {result.hashtags?.map(h=>(
                              <span key={h} onClick={()=>copyText(`h${h}`,`#${h.replace(/^#/,"")}`)} style={{ background:`${COLORS.magenta}15`, border:`1px solid ${COLORS.magenta}33`, borderRadius:999, padding:"4px 10px", color:COLORS.magenta, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                                #{h.replace(/^#/,"")}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Tips */}
                        {result.engagementTips && (
                          <div style={{ gridColumn:"1/-1", background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}>💡 ENGAGEMENT TIPS</p>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                              {result.engagementTips?.map((t,i)=>(
                                <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                                  <span style={{ color:COLORS.magenta, fontWeight:800, fontSize:13, flexShrink:0 }}>{i+1}.</span>
                                  <span style={{ color:COLORS.muted, fontSize:13, lineHeight:1.5 }}>{t}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* VIDEO RESULT */}
                    {(resultType === "video" || resultType === "image-video" || resultType === "audio-video") && result && (
                      <div style={{ display:"grid", gap:14 }}>
                        {/* Video / animation prompt */}
                        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>
                              🎬 {resultType==="video"?"VIDEO PROMPT":resultType==="image-video"?"ANIMATION PROMPT":"VISUAL PROMPT"}
                            </p>
                            <button onClick={()=>copyText("vp",result.videoPrompt||result.animationPrompt||result.visualPrompt)} style={{ padding:"4px 10px",borderRadius:6,background: copied.vp?`${COLORS.green}22`:COLORS.surface,border:`1px solid ${copied.vp?COLORS.green:COLORS.border}`,color: copied.vp?COLORS.green:COLORS.muted,fontSize:11,fontWeight:600 }}>{copied.vp?"✓ Copied":"Copy"}</button>
                          </div>
                          <p style={{ color:COLORS.white, fontSize:13, lineHeight:1.7 }}>{result.videoPrompt || result.animationPrompt || result.visualPrompt}</p>
                          {(result.editingStyle||result.colorGrading) && <p style={{ color:COLORS.dim, fontSize:12, marginTop:10, fontStyle:"italic" }}>{result.editingStyle||result.colorGrading}</p>}
                        </div>
                        {/* Script */}
                        {result.script && (
                          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                              <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em" }}>📝 FULL SCRIPT</p>
                              <button onClick={()=>copyText("sc",result.script)} style={{ padding:"4px 10px",borderRadius:6,background: copied.sc?`${COLORS.green}22`:COLORS.surface,border:`1px solid ${copied.sc?COLORS.green:COLORS.border}`,color: copied.sc?COLORS.green:COLORS.muted,fontSize:11,fontWeight:600 }}>{copied.sc?"✓ Copied":"Copy"}</button>
                            </div>
                            <pre style={{ color:COLORS.white, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"'Inter',sans-serif" }}>{result.script}</pre>
                          </div>
                        )}
                        {/* Scenes */}
                        {result.scenes?.length > 0 && (
                          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}>🎞️ SCENE BREAKDOWN</p>
                            <div style={{ display:"grid", gap:10 }}>
                              {result.scenes.map((s,i)=>(
                                <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", background:COLORS.surface, borderRadius:10, borderLeft:`3px solid ${COLORS.magenta}` }}>
                                  <div style={{ flexShrink:0 }}>
                                    <div style={{ color:COLORS.magenta, fontSize:10, fontWeight:700, fontFamily:"monospace" }}>{s.time||s.timestamp}</div>
                                  </div>
                                  <div>
                                    <p style={{ color:COLORS.white, fontSize:12, fontWeight:600, marginBottom:3 }}>{s.visual||s.motion}</p>
                                    {s.audio && <p style={{ color:COLORS.muted, fontSize:12 }}>🎙 {s.audio}</p>}
                                    {s.text_overlay && <p style={{ color:COLORS.cyan, fontSize:12 }}>💬 "{s.text_overlay}"</p>}
                                    {s.mood && <p style={{ color:COLORS.muted, fontSize:12, fontStyle:"italic" }}>{s.mood}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Hook + music + caption */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                          <div style={{ background:`${COLORS.gold}0D`, border:`1px solid ${COLORS.gold}44`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>⚡ HOOK</p>
                            <p style={{ color:COLORS.goldLight, fontWeight:700, fontSize:14 }}>"{result.hook}"</p>
                            <p style={{ color:COLORS.muted, fontSize:12, marginTop:8 }}>CTA: <span style={{color:COLORS.cyan}}>{result.cta}</span></p>
                          </div>
                          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>🎵 MUSIC MOOD</p>
                            <p style={{ color:COLORS.white, fontSize:13 }}>{result.musicMood}</p>
                            {result.duration && <p style={{ color:COLORS.muted, fontSize:12, marginTop:6 }}>Duration: <span style={{color:COLORS.cyan}}>{result.duration}</span></p>}
                          </div>
                        </div>
                        {/* Caption + hashtags */}
                        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:10 }}>✍️ CAPTION + HASHTAGS</p>
                          <p style={{ color:COLORS.white, fontSize:13, lineHeight:1.7, marginBottom:12 }}>{result.caption}</p>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {result.hashtags?.map(h=>(
                              <span key={h} style={{ background:`${COLORS.magenta}15`, border:`1px solid ${COLORS.magenta}33`, borderRadius:999, padding:"3px 9px", color:COLORS.magenta, fontSize:11, fontWeight:600 }}>
                                #{h.replace(/^#/,"")}
                              </span>
                            ))}
                          </div>
                          <button onClick={()=>copyText("vcap",`${result.caption}\n\n${result.hashtags?.map(h=>`#${h.replace(/^#/,"")}`).join(" ")}`)} style={{ marginTop:10, padding:"6px 14px", borderRadius:8, background: copied.vcap?`${COLORS.green}22`:COLORS.surface, border:`1px solid ${copied.vcap?COLORS.green:COLORS.border}`, color: copied.vcap?COLORS.green:COLORS.muted, fontSize:12, fontWeight:600 }}>
                            {copied.vcap?"✓ Copied all":"Copy caption + hashtags"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CAPTION RESULT */}
                    {resultType === "caption" && result && (
                      <div style={{ display:"grid", gap:14 }}>
                        {result.captions?.map((c,i)=>(
                          <div key={i} style={{ background:COLORS.card, border:`1px solid ${i===0?COLORS.magenta:COLORS.border}`, borderRadius:14, padding:18 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                {i===0 && <span style={{ background:COLORS.magenta, color:COLORS.white, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:999, letterSpacing:"0.08em" }}>BEST</span>}
                                <p style={{ color:COLORS.white, fontWeight:700, fontSize:13 }}>{c.version}</p>
                              </div>
                              <button onClick={()=>copyText(`cv${i}`,c.text)} style={{ padding:"4px 10px",borderRadius:6,background: copied[`cv${i}`]?`${COLORS.green}22`:COLORS.surface,border:`1px solid ${copied[`cv${i}`]?COLORS.green:COLORS.border}`,color: copied[`cv${i}`]?COLORS.green:COLORS.muted,fontSize:11,fontWeight:600 }}>{copied[`cv${i}`]?"✓ Copied":"Copy"}</button>
                            </div>
                            <p style={{ color:COLORS.white, fontSize:14, lineHeight:1.7 }}>{c.text}</p>
                          </div>
                        ))}
                        {/* Hashtag sets */}
                        {result.hashtags && (
                          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}># HASHTAG STRATEGY</p>
                            {Object.entries(result.hashtags).map(([group, tags])=>(
                              <div key={group} style={{ marginBottom:12 }}>
                                <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:"capitalize" }}>{group}</p>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                                  {tags.map(h=><span key={h} style={{ background:`${COLORS.magenta}15`, border:`1px solid ${COLORS.magenta}33`, borderRadius:999, padding:"3px 8px", color:COLORS.magenta, fontSize:11, fontWeight:600 }}>#{h.replace(/^#/,"")}</span>)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Meta */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                          <div style={{ background:`${COLORS.gold}0D`, border:`1px solid ${COLORS.gold}44`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>⚡ HOOK</p>
                            <p style={{ color:COLORS.goldLight, fontSize:14, fontWeight:600, lineHeight:1.5 }}>"{result.hook}"</p>
                          </div>
                          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>😊 EMOJI STRATEGY</p>
                            <p style={{ color:COLORS.white, fontSize:13, lineHeight:1.5 }}>{result.emojiStrategy}</p>
                          </div>
                        </div>
                        {result.engagementTips && (
                          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                            <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}>💡 TIPS</p>
                            {result.engagementTips.map((t,i)=>(
                              <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                                <span style={{ color:COLORS.magenta, fontWeight:800, flexShrink:0 }}>{i+1}.</span>
                                <span style={{ color:COLORS.muted, fontSize:13, lineHeight:1.5 }}>{t}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* RESIZE RESULT */}
                    {resultType === "resize" && result && (
                      <div style={{ display:"grid", gap:14 }}>
                        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:12 }}>📐 RESIZE GUIDE FOR ALL PLATFORMS</p>
                          <div style={{ display:"grid", gap:8 }}>
                            {result.resizeGuide?.map(r=>(
                              <div key={r.platform} style={{ display:"flex", gap:12, padding:"12px 14px", background:COLORS.surface, borderRadius:10 }}>
                                <div style={{ minWidth:120 }}><p style={{ color:COLORS.white, fontWeight:700, fontSize:13 }}>{r.platform}</p><p style={{ color:COLORS.magenta, fontSize:11, fontFamily:"monospace" }}>{r.dimensions}</p></div>
                                <div><p style={{ color:COLORS.muted, fontSize:12 }}>Crop: {r.cropFocus}</p><p style={{ color:COLORS.muted, fontSize:12, lineHeight:1.5 }}>{r.adjustments}</p></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:18 }}>
                          <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:10 }}>✍️ PLATFORM CAPTIONS</p>
                          {result.platformCaptions && Object.entries(result.platformCaptions).map(([plat, cap])=>(cap ? (
                            <div key={plat} style={{ marginBottom:12 }}>
                              <p style={{ color:COLORS.muted, fontSize:11, fontWeight:700, marginBottom:4, textTransform:"capitalize" }}>{plat}</p>
                              <p style={{ color:COLORS.white, fontSize:13, lineHeight:1.6 }}>{cap}</p>
                              <button onClick={()=>copyText(`rc${plat}`,cap)} style={{ marginTop:4, padding:"3px 10px", borderRadius:6, background: copied[`rc${plat}`]?`${COLORS.green}22`:COLORS.surface, border:`1px solid ${copied[`rc${plat}`]?COLORS.green:COLORS.border}`, color: copied[`rc${plat}`]?COLORS.green:COLORS.muted, fontSize:11, fontWeight:600 }}>{copied[`rc${plat}`]?"✓":"Copy"}</button>
                            </div>
                          ) : null))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ DASHBOARD ══════════════════════════ */}
      {page === "dashboard" && user && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>Dashboard</h1>
              <p style={{ color:COLORS.muted, fontSize:14 }}>Welcome back, {user.name}. Here's your content performance.</p>
            </div>
            <button onClick={()=>setPage("studio")} style={{ padding:"12px 24px", borderRadius:10, background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`, color:COLORS.white, fontWeight:700, fontSize:14, boxShadow:`0 4px 16px ${COLORS.magenta}44` }}>
              + New Content
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:28 }}>
            {[
              { label:"Credits Used", val: (plan?.credits||50)-credits, color:COLORS.magenta, icon:"⚡" },
              { label:"Posts Generated", val:history.length, color:COLORS.cyan, icon:"📝" },
              { label:"Platforms Connected", val:0, color:COLORS.gold, icon:"🔗" },
              { label:"Current Plan", val:plan?.name||"Free", color:COLORS.green, icon:"⭐" },
            ].map(s=>(
              <div key={s.label} style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:"20px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ color:COLORS.muted, fontSize:11, fontWeight:700, letterSpacing:"0.08em" }}>{s.icon}</span>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:s.color }}/>
                </div>
                <p style={{ color:s.color, fontWeight:800, fontSize:26, letterSpacing:"-0.02em" }}>{s.val}</p>
                <p style={{ color:COLORS.muted, fontSize:12, marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Credit bar */}
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, padding:"20px 22px", marginBottom:28 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <p style={{ fontWeight:700, fontSize:14 }}>Credits this month</p>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:COLORS.white, fontWeight:700 }}>{credits} / {plan?.credits||50}</span>
                <button onClick={()=>setPage("pricing")} style={{ padding:"5px 12px", borderRadius:8, background:`${COLORS.magenta}22`, color:COLORS.magenta, fontSize:12, fontWeight:700, border:`1px solid ${COLORS.magenta}44` }}>Upgrade</button>
              </div>
            </div>
            <div style={{ height:8, background:COLORS.border, borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", background:`linear-gradient(90deg,${COLORS.magenta},${COLORS.cyan})`, width:`${Math.min((credits/(plan?.credits||50))*100,100)}%`, borderRadius:4, transition:"width 0.5s" }}/>
            </div>
          </div>

          {/* History table */}
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"18px 22px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontWeight:700, fontSize:15 }}>Generated Content</p>
              <span style={{ color:COLORS.muted, fontSize:12 }}>{history.length} items</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding:"48px 22px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>📂</div>
                <p style={{ color:COLORS.muted }}>No content generated yet.</p>
                <button onClick={()=>setPage("studio")} style={{ marginTop:14, padding:"10px 22px", borderRadius:10, background:`${COLORS.magenta}22`, color:COLORS.magenta, fontWeight:700, fontSize:13, border:`1px solid ${COLORS.magenta}44` }}>Start creating</button>
              </div>
            ) : (
              <div>
                {history.map(h=>{
                  const p = PLATFORMS.find(pl=>pl.id===h.platform);
                  const tool = STUDIO_TOOLS.find(t=>t.id===h.tool);
                  return (
                    <div key={h.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 22px", borderBottom:`1px solid ${COLORS.border}`, cursor:"pointer" }} onClick={()=>{setResult(h.result);setResultType(h.type);setActiveTool(h.tool);setPrompt(h.prompt);setPage("studio");}}>
                      <div style={{ width:36,height:36,borderRadius:10,background:`${COLORS.magenta}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{tool?.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:COLORS.white, fontWeight:600, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.prompt || `${tool?.label} — ${h.format}`}</p>
                        <p style={{ color:COLORS.muted, fontSize:12 }}>{tool?.label} · {p?.name} · {h.format}</p>
                      </div>
                      <p style={{ color:COLORS.dim, fontSize:11, flexShrink:0 }}>{new Date(h.id).toLocaleDateString()}</p>
                      <button style={{ padding:"5px 12px", borderRadius:7, background:`${COLORS.magenta}22`, color:COLORS.magenta, fontSize:11, fontWeight:700, border:`1px solid ${COLORS.magenta}44`, flexShrink:0 }}>Open →</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Studio gated if no user ── */}
      {page === "studio" && !user && (
        <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
            <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Sign in to use the Studio</h2>
            <p style={{ color:COLORS.muted, marginBottom:24 }}>Create a free account to start generating content.</p>
            <button onClick={()=>{setAuthMode("signup");setPage("auth");}} style={{ padding:"13px 28px", borderRadius:12, background:`linear-gradient(90deg,${COLORS.magenta},#7C3AED)`, color:COLORS.white, fontWeight:800, fontSize:15 }}>Create free account →</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  );
}
