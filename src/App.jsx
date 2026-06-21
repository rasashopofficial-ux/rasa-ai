import { useState, useRef, useCallback } from "react";

const C = {
  bg: "#07080F",
  surface: "#0E1120",
  card: "#141728",
  border: "#1E2340",
  pink: "#D946EF",
  cyan: "#22D3EE",
  gold: "#F59E0B",
  white: "#F8FAFF",
  muted: "#8892B0",
  dim: "#3D4466",
  green: "#10B981",
  red: "#F87171",
};

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "IG", color: "#E1306C" },
  { id: "youtube",   name: "YouTube",   icon: "YT", color: "#FF0000" },
  { id: "facebook",  name: "Facebook",  icon: "FB", color: "#1877F2" },
  { id: "tiktok",    name: "TikTok",    icon: "TT", color: "#010101" },
  { id: "twitter",   name: "X/Twitter", icon: "TW", color: "#1DA1F2" },
  { id: "linkedin",  name: "LinkedIn",  icon: "LI", color: "#0077B5" },
];

const FORMATS = {
  instagram: ["Post 1:1", "Story 9:16", "Reel 9:16", "Carousel"],
  youtube:   ["Short 9:16", "Video 16:9", "Thumbnail", "Community"],
  facebook:  ["Post", "Story", "Reel", "Cover"],
  tiktok:    ["Video 9:16", "Photo", "Story"],
  twitter:   ["Post", "Card", "Header"],
  linkedin:  ["Post", "Story", "Article"],
};

const TOOLS = [
  { id: "image",   label: "Text to Image",  icon: "IMG", desc: "Generate real AI images" },
  { id: "video",   label: "Text to Video",  icon: "VID", desc: "Full video script and scenes" },
  { id: "img2vid", label: "Image to Video", icon: "I2V", desc: "Animate your photos" },
  { id: "aud2vid", label: "Audio to Video", icon: "A2V", desc: "Visuals from audio" },
  { id: "caption", label: "AI Caption",     icon: "CAP", desc: "Viral captions and hashtags" },
  { id: "resize",  label: "Smart Resize",   icon: "RSZ", desc: "Format for all platforms" },
];

const TONES = ["Viral", "Luxury", "Funny", "Educational", "Inspiring", "Edgy"];

async function callAI(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: "You are a viral social media content expert. You know Instagram, YouTube, TikTok, Facebook algorithms deeply. Always respond with valid JSON only. No markdown. No backticks. No extra text.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  const text = data.content?.map(function(b) { return b.text || ""; }).join("") || "";
  return JSON.parse(text);
}

function Btn({ label, onClick, primary, small, disabled, color, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "6px 12px" : "12px 20px",
        borderRadius: 10,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: primary ? "linear-gradient(90deg,#D946EF,#7C3AED)" : color ? color + "22" : C.card,
        color: primary ? C.white : color || C.muted,
        fontWeight: 700,
        fontSize: small ? 11 : 14,
        width: full ? "100%" : "auto",
        fontFamily: "inherit",
        boxShadow: primary ? "0 4px 16px #D946EF44" : "none",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Card({ children, accent, style }) {
  return (
    <div style={{
      background: C.card,
      border: "1px solid " + (accent || C.border),
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ text }) {
  return (
    <p style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>
      {text}
    </p>
  );
}

function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard && navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(function() { setDone(false); }, 2000);
  }
  return (
    <button onClick={copy} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid " + (done ? C.green : C.border), background: done ? C.green + "22" : C.surface, color: done ? C.green : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
      {done ? "Copied!" : (label || "Copy")}
    </button>
  );
}

function ScoreRing({ score }) {
  var color = score >= 80 ? C.green : score >= 60 ? C.gold : C.red;
  return (
    <div style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid " + color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: color, fontWeight: 800, fontSize: 20 }}>{score}%</div>
        <div style={{ color: C.muted, fontSize: 8, fontWeight: 700 }}>VIRAL</div>
      </div>
    </div>
  );
}

export default function RasaAI() {
  var [page, setPage] = useState("landing");
  var [user, setUser] = useState(null);
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var [name, setName] = useState("");
  var [authMode, setAuthMode] = useState("signup");
  var [tool, setTool] = useState("image");
  var [platform, setPlatform] = useState("instagram");
  var [format, setFormat] = useState("Post 1:1");
  var [tone, setTone] = useState("Viral");
  var [prompt, setPrompt] = useState("");
  var [loading, setLoading] = useState(false);
  var [result, setResult] = useState(null);
  var [error, setError] = useState("");
  var [credits, setCredits] = useState(300);
  var [copied, setCopied] = useState({});
  var [publishStatus, setPublishStatus] = useState({});
  var [history, setHistory] = useState([]);
  var fileRef = useRef();
  var audioRef = useRef();
  var [uploadedFile, setUploadedFile] = useState(null);
  var [uploadedAudio, setUploadedAudio] = useState(null);

  var pName = PLATFORMS.find(function(p) { return p.id === platform; })?.name || "Instagram";

  function login(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !pass) { setError("Please fill all fields"); return; }
    setUser({ name: name || email.split("@")[0], email: email });
    setPage("studio");
    setError("");
  }

  var generate = useCallback(async function() {
    if (!prompt.trim() && tool !== "img2vid" && tool !== "aud2vid") {
      setError("Please enter a description");
      return;
    }
    if (credits <= 0) { setError("No credits left. Please upgrade."); return; }
    setLoading(true);
    setResult(null);
    setError("");

    try {
      var userPrompt = "";

      if (tool === "image") {
        userPrompt = 'Generate viral image content for ' + pName + ' ' + format + '. Tone: ' + tone + '. Brief: ' + prompt + '. Return JSON with these exact keys: imagePrompt (200 word photorealistic prompt for Midjourney or DALLE, include camera angle, lighting, lens, color grading), negativePrompt (what to avoid), caption (viral caption with emojis), captionV2 (alternative caption), captionV3 (short punchy caption), hook (3 second scroll stopping hook), hookV2 (second hook option), hookV3 (third hook option), hashtags (array of 15 tags), viralHashtags (array of 5 most viral tags), cta (call to action), bestTime (best day and time to post), viralityScore (number between 70 and 95), viralityReason (why this will go viral), algorithmTip1 (platform tip), algorithmTip2, algorithmTip3, algorithmTip4, algorithmTip5, postingStrategy (what to do in first 60 minutes after posting), competitorInsight (what top creators do in this niche), colorPalette (array of 3 hex colors)';
      } else if (tool === "video") {
        userPrompt = 'Generate viral video content for ' + pName + ' ' + format + '. Tone: ' + tone + '. Brief: ' + prompt + '. Return JSON with: videoPrompt (200 word cinematic video generation prompt for Sora or Runway), script (complete word for word script with scene markers), scene1time, scene1visual, scene1audio, scene1text, scene2time, scene2visual, scene2audio, scene2text, scene3time, scene3visual, scene3audio, scene3text, scene4time, scene4visual, scene4audio, scene4text, hook (3 second hook), hookV2, hookV3, caption, captionV2, hashtags (array of 15), cta, duration, musicMood, editingStyle, viralityScore (70-95), viralityReason, algorithmTip1, algorithmTip2, algorithmTip3, algorithmTip4, algorithmTip5, postingStrategy, thumbnailPrompt';
      } else if (tool === "img2vid") {
        userPrompt = 'Generate image to video animation brief for ' + pName + '. File: ' + (uploadedFile ? uploadedFile.name : 'image') + '. Tone: ' + tone + '. Instructions: ' + (prompt || 'Animate naturally') + '. Return JSON with: animationPrompt (200 word Runway or Pika animation prompt), motionDescription, scene1time, scene1motion, scene2time, scene2motion, scene3time, scene3motion, caption, hashtags (array of 10), musicMood, hook, cta, viralityScore (70-95), viralityReason, postingStrategy';
      } else if (tool === "aud2vid") {
        userPrompt = 'Generate audio to video visual brief for ' + pName + '. Audio: ' + (uploadedAudio ? uploadedAudio.name : "audio file") + '. Tone: ' + tone + '. Brief: ' + (prompt || 'Match the audio mood') + '. Return JSON with: visualPrompt (200 word video generation prompt), scene1timestamp, scene1visual, scene1mood, scene2timestamp, scene2visual, scene2mood, scene3timestamp, scene3visual, scene3mood, colorGrading, typography, caption, hashtags (array of 10), hook, cta, viralityScore (70-95), viralityReason, postingStrategy';
      } else if (tool === "caption") {
        userPrompt = 'Generate viral captions for ' + pName + ' ' + format + '. Tone: ' + tone + '. Content: ' + prompt + '. Return JSON with: caption1 (curiosity gap style), caption2 (bold statement style), caption3 (story hook style), caption4 (list format style), hook1, hook2, hook3, hashtags (array of 15), viralHashtags (array of 5), nicheHashtags (array of 5), broadHashtags (array of 5), cta, emojiStrategy, bestTime, viralityScore (70-95), viralityReason, algorithmTip1, algorithmTip2, algorithmTip3, algorithmTip4, algorithmTip5, postingStrategy, engagementBait';
      } else if (tool === "resize") {
        userPrompt = 'Generate resize guide for content across all platforms. Original: ' + format + ' for ' + pName + '. Tone: ' + tone + '. Content: ' + prompt + '. Return JSON with: instagramPost (dimensions and tips), instagramStory, instagramReel, youtubeThumb, youtubeCover, tiktokVideo, facebookPost, facebookStory, twitterCard, linkedinPost, masterCaption, instagramCaption, youtubeCaption, tiktokCaption, facebookCaption, twitterCaption, linkedinCaption, allHashtags (array of 10), repurposeTip1, repurposeTip2, repurposeTip3';
      }

      var data = await callAI(userPrompt);

      if (tool === "image" && data.imagePrompt) {
        data.imageUrl = "https://image.pollinations.ai/prompt/" + encodeURIComponent(data.imagePrompt.slice(0, 500)) + "?width=1080&height=1080&nologo=true&seed=" + Date.now();
      }

      setResult(data);
      setCredits(function(c) { return c - 1; });
      setHistory(function(h) { return [{ id: Date.now(), tool: tool, platform: platform, prompt: prompt, result: data }].concat(h).slice(0, 30); });

    } catch (err) {
      setError("Generation failed. Check your API key in Vercel environment variables.");
    }
    setLoading(false);
  }, [prompt, tool, platform, format, tone, credits, uploadedFile, uploadedAudio, pName]);

  function copyItem(key, text) {
    navigator.clipboard && navigator.clipboard.writeText(text);
    setCopied(function(c) { var n = Object.assign({}, c); n[key] = true; return n; });
    setTimeout(function() { setCopied(function(c) { var n = Object.assign({}, c); n[key] = false; return n; }); }, 2000);
  }

  function publish(pid) {
    setPublishStatus(function(s) { var n = Object.assign({}, s); n[pid] = "publishing"; return n; });
    setTimeout(function() {
      setPublishStatus(function(s) { var n = Object.assign({}, s); n[pid] = "done"; return n; });
    }, 2000);
  }

  var styles = {
    page: { minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Inter', system-ui, sans-serif" },
    nav: { height: 60, background: C.surface + "ee", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" },
    h1: { fontSize: "clamp(32px,5vw,64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px" },
    input: { width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: "11px 14px", color: C.white, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    textarea: { width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: "11px 14px", color: C.white, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" },
  };

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07080F; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2E3450; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input:focus, textarea:focus, select:focus { border-color: #D946EF !important; box-shadow: 0 0 0 3px #D946EF18; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <button onClick={function() { setPage("landing"); }} style={{ background: "none", border: "none", color: C.white, fontWeight: 800, fontSize: 20, cursor: "pointer", fontFamily: "inherit" }}>
          rasa<span style={{ color: C.pink }}>.ai</span>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user ? (
            <>
              <button onClick={function() { setPage("studio"); }} style={{ background: page === "studio" ? C.pink + "22" : "none", border: "none", color: page === "studio" ? C.pink : C.muted, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Studio</button>
              <button onClick={function() { setPage("dashboard"); }} style={{ background: page === "dashboard" ? C.pink + "22" : "none", border: "none", color: page === "dashboard" ? C.pink : C.muted, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Dashboard</button>
              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 99, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#D946EF,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{user.name[0].toUpperCase()}</div>
                <span style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                <span style={{ color: C.pink, fontSize: 11, fontWeight: 700 }}>{credits}cr</span>
              </div>
              <button onClick={function() { setUser(null); setPage("landing"); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Sign out</button>
            </>
          ) : (
            <>
              <button onClick={function() { setPage("pricing"); }} style={{ background: "none", border: "none", color: C.muted, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Pricing</button>
              <button onClick={function() { setAuthMode("login"); setPage("auth"); }} style={{ background: "none", border: "1px solid " + C.border, color: C.white, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Sign in</button>
              <button onClick={function() { setAuthMode("signup"); setPage("auth"); }} style={{ background: "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: C.white, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", boxShadow: "0 4px 16px #D946EF44" }}>Start free</button>
            </>
          )}
        </div>
      </nav>

      {/* LANDING */}
      {page === "landing" && (
        <div>
          <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", background: "radial-gradient(ellipse 80% 60% at 50% 40%,#D946EF08 0%,transparent 70%)" }}>
            <div style={{ maxWidth: 700, textAlign: "center", animation: "fadeIn 0.8s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.pink + "18", border: "1px solid " + C.pink + "44", borderRadius: 99, padding: "5px 14px", marginBottom: 20 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.pink, animation: "pulse 1.5s infinite" }}></div>
                <span style={{ color: C.pink, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>AI SOCIAL MEDIA STUDIO</span>
              </div>
              <h1 style={styles.h1}>
                Create content that{" "}
                <span style={{ background: "linear-gradient(90deg,#D946EF,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  actually goes viral.
                </span>
              </h1>
              <p style={{ color: C.muted, fontSize: 18, lineHeight: 1.7, marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
                Generate real AI images, viral captions, video scripts and hashtags. Built for influencers who want results.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
                <button onClick={function() { setAuthMode("signup"); setPage("auth"); }} style={{ padding: "15px 32px", borderRadius: 12, background: "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: C.white, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 30px #D946EF44" }}>Start creating free</button>
                <button onClick={function() { setPage("pricing"); }} style={{ padding: "15px 28px", borderRadius: 12, background: "none", border: "1px solid " + C.border, color: C.white, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>See pricing</button>
              </div>
              <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
                {[["50K+","Creators"],["12M+","Posts made"],["6","Platforms"]].map(function(s) {
                  return (
                    <div key={s[1]} style={{ textAlign: "center" }}>
                      <div style={{ color: C.white, fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em" }}>{s[0]}</div>
                      <div style={{ color: C.muted, fontSize: 12 }}>{s[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: "80px 24px", background: C.surface }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em" }}>Everything you need to go viral</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
                {[
                  { icon: "IMG", title: "Real Image Generation", desc: "Type a description and get a photorealistic image instantly. Download and post." },
                  { icon: "VID", title: "Video Script + Scenes", desc: "Complete video scripts with scene breakdown, hooks and captions for Reels and Shorts." },
                  { icon: "I2V", title: "Image to Video", desc: "Upload any photo and get a full animation prompt for Runway or Pika." },
                  { icon: "A2V", title: "Audio to Video", desc: "Upload audio or voiceover and get synced visual scene descriptions." },
                  { icon: "CAP", title: "4 Caption Versions", desc: "Get 4 different caption styles plus 3 hooks and full hashtag strategy." },
                  { icon: "SCR", title: "Viral Score", desc: "Every piece of content gets a viral score with algorithm tips and posting strategy." },
                  { icon: "ALG", title: "Algorithm Tips", desc: "5 specific tips for each platform to maximise reach and engagement." },
                  { icon: "60M", title: "60 Min Strategy", desc: "Exactly what to do after posting to boost your content in the algorithm." },
                  { icon: "PUB", title: "Publish Ready", desc: "Download image, copy caption and hashtags with one tap. Ready to post." },
                ].map(function(f) {
                  return (
                    <div key={f.title} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "22px 20px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.pink + "22", border: "1px solid " + C.pink + "44", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: C.pink, fontWeight: 800, fontSize: 11 }}>{f.icon}</div>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: C.white }}>{f.title}</p>
                      <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: "80px 24px", textAlign: "center" }}>
            <h2 style={{ fontSize: 44, fontWeight: 900, marginBottom: 16, letterSpacing: "-0.03em" }}>Start in 30 seconds.</h2>
            <p style={{ color: C.muted, fontSize: 17, marginBottom: 32 }}>No credit card needed. 300 free credits on signup.</p>
            <button onClick={function() { setAuthMode("signup"); setPage("auth"); }} style={{ padding: "16px 40px", borderRadius: 12, background: "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: C.white, fontWeight: 800, fontSize: 17, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 40px #D946EF44" }}>Create free account</button>
          </div>

          <div style={{ borderTop: "1px solid " + C.border, padding: "24px", textAlign: "center" }}>
            <p style={{ color: C.dim, fontSize: 13 }}>rasa.ai - 2025 - All rights reserved</p>
          </div>
        </div>
      )}

      {/* AUTH */}
      {page === "auth" && (
        <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 400, animation: "fadeIn 0.4s ease" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>{authMode === "signup" ? "Create your account" : "Welcome back"}</h2>
            <p style={{ color: C.muted, fontSize: 14, textAlign: "center", marginBottom: 28 }}>{authMode === "signup" ? "300 free credits. No card needed." : "Sign in to continue"}</p>
            <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, padding: 28 }}>
              {authMode === "signup" && (
                <div style={{ marginBottom: 12 }}>
                  <Label text="Your Name" />
                  <input style={styles.input} value={name} onChange={function(e) { setName(e.target.value); }} placeholder="e.g. Priya Sharma" />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <Label text="Email" />
                <input style={styles.input} type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="you@email.com" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <Label text="Password" />
                <input style={styles.input} type="password" value={pass} onChange={function(e) { setPass(e.target.value); }} placeholder="Min 8 characters" onKeyDown={function(e) { if (e.key === "Enter") login(); }} />
              </div>
              {error && <p style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</p>}
              <button onClick={login} style={{ width: "100%", padding: "13px", borderRadius: 10, background: "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: C.white, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px #D946EF44", marginBottom: 16 }}>
                {authMode === "signup" ? "Create account" : "Sign in"}
              </button>
              <p style={{ textAlign: "center", color: C.muted, fontSize: 13 }}>
                {authMode === "signup" ? "Already have an account? " : "New here? "}
                <button onClick={function() { setAuthMode(authMode === "signup" ? "login" : "signup"); }} style={{ background: "none", border: "none", color: C.pink, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                  {authMode === "signup" ? "Sign in" : "Create account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PRICING */}
      {page === "pricing" && (
        <div style={{ padding: "60px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Simple pricing</h2>
          <p style={{ textAlign: "center", color: C.muted, marginBottom: 48, fontSize: 16 }}>Start free. Upgrade when ready.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {[
              { name: "Starter", price: 9, credits: 50, color: C.cyan, features: ["50 credits/month","Image generation","Captions and hashtags","3 platforms","720p download"] },
              { name: "Creator", price: 29, credits: 300, color: C.pink, popular: true, features: ["300 credits/month","All AI tools","All 6 platforms","4K download","Priority support","Brand kit","Scheduler"] },
              { name: "Pro", price: 79, credits: 1000, color: C.gold, features: ["1000 credits/month","Everything in Creator","5 team seats","API access","White-label","Analytics","Dedicated manager"] },
            ].map(function(plan) {
              return (
                <div key={plan.name} style={{ background: plan.popular ? "linear-gradient(160deg,#141728,#1A0A2E)" : C.card, border: "1.5px solid " + (plan.popular ? C.pink : C.border), borderRadius: 18, padding: "28px 24px", position: "relative" }}>
                  {plan.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#D946EF,#7C3AED)", borderRadius: 99, padding: "3px 14px", color: C.white, fontSize: 10, fontWeight: 700 }}>MOST POPULAR</div>}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: plan.color + "22", border: "1px solid " + plan.color + "44", marginBottom: 14 }}></div>
                  <p style={{ color: plan.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{plan.name}</p>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ color: C.white, fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em" }}>${plan.price}</span>
                    <span style={{ color: C.muted, fontSize: 14 }}>/mo</span>
                  </div>
                  {plan.features.map(function(f) {
                    return <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8 }}><span style={{ color: C.green }}>&#10003;</span><span style={{ color: C.white, fontSize: 13 }}>{f}</span></div>;
                  })}
                  <button onClick={function() { user ? setPage("studio") : setPage("auth"); }} style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 10, background: plan.popular ? "linear-gradient(90deg,#D946EF,#7C3AED)" : plan.color + "22", border: "none", color: plan.popular ? C.white : plan.color, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                    Start {plan.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STUDIO */}
      {page === "studio" && user && (
        <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: 210, background: C.surface, borderRight: "1px solid " + C.border, padding: "14px 10px", overflowY: "auto", flexShrink: 0 }}>
            {/* Credits */}
            <div style={{ background: C.card, borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid " + C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: C.muted, fontSize: 10, fontWeight: 700 }}>CREDITS</span>
                <span style={{ color: C.pink, fontSize: 10, fontWeight: 700 }}>FREE</span>
              </div>
              <div style={{ color: C.white, fontWeight: 800, fontSize: 24, marginBottom: 6 }}>{credits}</div>
              <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#D946EF,#22D3EE)", borderRadius: 2, width: Math.min((credits / 300) * 100, 100) + "%" }}></div>
              </div>
              <button onClick={function() { setPage("pricing"); }} style={{ width: "100%", marginTop: 10, padding: "7px", borderRadius: 7, background: C.pink + "22", border: "1px solid " + C.pink + "44", color: C.pink, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Upgrade</button>
            </div>

            {/* Tools */}
            <p style={{ color: C.dim, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 4 }}>AI TOOLS</p>
            {TOOLS.map(function(t) {
              return (
                <button key={t.id} onClick={function() { setTool(t.id); setResult(null); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", borderRadius: 9, marginBottom: 3, background: tool === t.id ? C.pink + "18" : "none", color: tool === t.id ? C.pink : C.muted, fontWeight: tool === t.id ? 700 : 500, fontSize: 12, textAlign: "left", border: tool === t.id ? "1px solid " + C.pink + "44" : "1px solid transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: tool === t.id ? C.pink + "22" : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0, color: tool === t.id ? C.pink : C.muted }}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}

            {/* History */}
            {history.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ borderTop: "1px solid " + C.border, marginBottom: 12 }}></div>
                <p style={{ color: C.dim, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 4 }}>RECENT</p>
                {history.slice(0, 6).map(function(h) {
                  return (
                    <button key={h.id} onClick={function() { setResult(h.result); setTool(h.tool); setPrompt(h.prompt); }} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, background: "none", border: "none", color: C.dim, fontSize: 11, textAlign: "left", cursor: "pointer", fontFamily: "inherit", marginBottom: 2 }}>
                      {h.prompt.slice(0, 28)}{h.prompt.length > 28 ? "..." : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* TOP BAR */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: C.surface }}>
              {PLATFORMS.map(function(p) {
                return (
                  <button key={p.id} onClick={function() { setPlatform(p.id); setFormat(FORMATS[p.id][0]); }} style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 600, background: platform === p.id ? p.color + "22" : "none", color: platform === p.id ? p.color : C.muted, border: platform === p.id ? "1px solid " + p.color + "55" : "1px solid transparent", cursor: "pointer", fontFamily: "inherit" }}>
                    {p.name}
                  </button>
                );
              })}
              <div style={{ width: 1, height: 20, background: C.border }}></div>
              <select value={format} onChange={function(e) { setFormat(e.target.value); }} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 7, padding: "5px 10px", color: C.white, fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>
                {(FORMATS[platform] || []).map(function(f) { return <option key={f}>{f}</option>; })}
              </select>
              <select value={tone} onChange={function(e) { setTone(e.target.value); }} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 7, padding: "5px 10px", color: C.white, fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>
                {TONES.map(function(t) { return <option key={t}>{t}</option>; })}
              </select>
            </div>

            {/* SPLIT PANEL */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

              {/* INPUT */}
              <div style={{ width: 340, borderRight: "1px solid " + C.border, padding: 16, overflowY: "auto", flexShrink: 0 }}>
                <p style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{TOOLS.find(function(t2) { return t2.id === tool; })?.label}</p>
                <p style={{ color: C.muted, fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>{TOOLS.find(function(t2) { return t2.id === tool; })?.desc}</p>

                {tool === "img2vid" && (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={function(e) { setUploadedFile(e.target.files[0]); }} style={{ display: "none" }} />
                    <div onClick={function() { fileRef.current && fileRef.current.click(); }} style={{ border: "2px dashed " + (uploadedFile ? C.pink : C.border), borderRadius: 10, padding: "20px 14px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: uploadedFile ? C.pink + "08" : "none" }}>
                      {uploadedFile ? <p style={{ color: C.pink, fontSize: 13, fontWeight: 600 }}>{uploadedFile.name}</p> : <p style={{ color: C.muted, fontSize: 13 }}>Click to upload image</p>}
                    </div>
                  </div>
                )}

                {tool === "aud2vid" && (
                  <div>
                    <input ref={audioRef} type="file" accept="audio/*" onChange={function(e) { setUploadedAudio(e.target.files[0]); }} style={{ display: "none" }} />
                    <div onClick={function() { audioRef.current && audioRef.current.click(); }} style={{ border: "2px dashed " + (uploadedAudio ? C.cyan : C.border), borderRadius: 10, padding: "20px 14px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: uploadedAudio ? C.cyan + "08" : "none" }}>
                      {uploadedAudio ? <p style={{ color: C.cyan, fontSize: 13, fontWeight: 600 }}>{uploadedAudio.name}</p> : <p style={{ color: C.muted, fontSize: 13 }}>Click to upload audio</p>}
                    </div>
                  </div>
                )}

                <Label text={tool === "img2vid" ? "Animation instructions (optional)" : tool === "aud2vid" ? "Visual style brief (optional)" : "Your brief"} />
                <textarea style={styles.textarea} value={prompt} onChange={function(e) { setPrompt(e.target.value); }} placeholder={
                  tool === "image" ? "e.g. A luxury skincare brand launching a rose serum. Dewy glowing skin, gold packaging, soft pink aesthetic. Women 25-40..." :
                  tool === "video" ? "e.g. A 30-second reel about my morning fitness routine. Motivational, energetic, show transformation..." :
                  tool === "img2vid" ? "e.g. Slow zoom in, add floating particles, dreamy atmosphere..." :
                  tool === "aud2vid" ? "e.g. Abstract visuals matching the energy and beats of the track..." :
                  tool === "caption" ? "e.g. Just posted my new YouTube video about sustainable fashion. Want to drive clicks and saves..." :
                  "e.g. A travel photo from Bali. Needs reformatting for all my platforms..."
                } />

                {error && <p style={{ color: C.red, fontSize: 12, marginTop: 8, marginBottom: 8 }}>{error}</p>}

                <button onClick={generate} disabled={loading} style={{ width: "100%", marginTop: 12, padding: "13px", borderRadius: 10, background: loading ? C.card : "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: loading ? C.dim : C.white, fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 20px #D946EF44" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid " + C.dim, borderTopColor: C.muted, borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                      Generating...
                    </span>
                  ) : "Generate - 1 credit"}
                </button>
                <p style={{ color: C.dim, fontSize: 11, textAlign: "center", marginTop: 6 }}>{credits} credits remaining</p>
              </div>

              {/* RESULT */}
              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                {!result && !loading && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.4 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                    <p style={{ color: C.muted, fontSize: 15, fontWeight: 600 }}>Your content appears here</p>
                    <p style={{ color: C.dim, fontSize: 13, marginTop: 4 }}>Fill in the brief and tap Generate</p>
                  </div>
                )}

                {loading && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid " + C.pink + "44", borderTopColor: C.pink, animation: "spin 1s linear infinite" }}></div>
                    <p style={{ color: C.muted, fontSize: 14 }}>Creating viral content...</p>
                  </div>
                )}

                {result && !loading && (
                  <div style={{ animation: "fadeIn 0.4s ease" }}>

                    {/* PUBLISH BAR */}
                    <Card style={{ marginBottom: 14 }}>
                      <Label text="Publish to" />
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {PLATFORMS.map(function(p) {
                          var st = publishStatus[p.id];
                          return (
                            <button key={p.id} onClick={function() { publish(p.id); }} disabled={st === "done"} style={{ padding: "7px 12px", borderRadius: 7, border: "none", background: st === "done" ? C.green + "22" : p.color + "22", color: st === "done" ? C.green : p.color, fontWeight: 600, fontSize: 11, cursor: st === "done" ? "default" : "pointer", fontFamily: "inherit" }}>
                              {st === "publishing" ? "..." : st === "done" ? "Posted!" : p.name}
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    {/* VIRALITY SCORE */}
                    {result.viralityScore && (
                      <Card accent={C.pink + "44"} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                          <ScoreRing score={result.viralityScore} />
                          <div style={{ flex: 1 }}>
                            <p style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Viral Potential Analysis</p>
                            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, marginBottom: result.competitorInsight ? 8 : 0 }}>{result.viralityReason}</p>
                            {result.competitorInsight && <p style={{ color: C.cyan, fontSize: 12, fontStyle: "italic" }}>Insight: {result.competitorInsight}</p>}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* REAL IMAGE */}
                    {result.imageUrl && (
                      <Card style={{ marginBottom: 14 }}>
                        <Label text="Generated Image" />
                        <img src={result.imageUrl} alt="AI Generated" style={{ width: "100%", borderRadius: 10, maxHeight: 400, objectFit: "cover", display: "block" }} onError={function(e) { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
                        <p style={{ display: "none", color: C.muted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Image loading... Copy the prompt below to use in Midjourney or DALL-E</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <a href={result.imageUrl} target="_blank" rel="noreferrer" download="rasa-image.jpg" style={{ padding: "9px 18px", borderRadius: 9, background: "linear-gradient(90deg,#D946EF,#7C3AED)", color: C.white, fontWeight: 700, fontSize: 13, display: "inline-block" }}>Download Image</a>
                          <CopyBtn text={result.imagePrompt || ""} label="Copy Prompt" />
                        </div>
                      </Card>
                    )}

                    {/* VIDEO PROMPT */}
                    {result.videoPrompt && (
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <Label text="Video Generation Prompt (Sora / Runway / Pika)" />
                          <CopyBtn text={result.videoPrompt} />
                        </div>
                        <p style={{ color: C.white, fontSize: 13, lineHeight: 1.7 }}>{result.videoPrompt}</p>
                      </Card>
                    )}

                    {/* ANIMATION PROMPT */}
                    {result.animationPrompt && (
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <Label text="Animation Prompt (Runway / Pika)" />
                          <CopyBtn text={result.animationPrompt} />
                        </div>
                        <p style={{ color: C.white, fontSize: 13, lineHeight: 1.7 }}>{result.animationPrompt}</p>
                      </Card>
                    )}

                    {/* VISUAL PROMPT */}
                    {result.visualPrompt && (
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <Label text="Visual Prompt for Audio Video" />
                          <CopyBtn text={result.visualPrompt} />
                        </div>
                        <p style={{ color: C.white, fontSize: 13, lineHeight: 1.7 }}>{result.visualPrompt}</p>
                      </Card>
                    )}

                    {/* SCRIPT */}
                    {result.script && (
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <Label text="Full Video Script" />
                          <CopyBtn text={result.script} />
                        </div>
                        <pre style={{ color: C.white, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{result.script}</pre>
                      </Card>
                    )}

                    {/* SCENES */}
                    {result.scene1time && (
                      <Card style={{ marginBottom: 14 }}>
                        <Label text="Scene Breakdown" />
                        {[
                          { time: result.scene1time, visual: result.scene1visual, audio: result.scene1audio, text: result.scene1text },
                          { time: result.scene2time, visual: result.scene2visual, audio: result.scene2audio, text: result.scene2text },
                          { time: result.scene3time, visual: result.scene3visual, audio: result.scene3audio, text: result.scene3text },
                          { time: result.scene4time, visual: result.scene4visual, audio: result.scene4audio, text: result.scene4text },
                        ].filter(function(s) { return s.time; }).map(function(s, i) {
                          return (
                            <div key={i} style={{ background: C.surface, borderRadius: 9, padding: "10px 12px", marginBottom: 8, borderLeft: "3px solid " + C.pink }}>
                              <p style={{ color: C.pink, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{s.time}</p>
                              <p style={{ color: C.white, fontSize: 13, marginBottom: s.audio ? 4 : 0 }}>{s.visual}</p>
                              {s.audio && <p style={{ color: C.muted, fontSize: 12 }}>Audio: {s.audio}</p>}
                              {s.text && <p style={{ color: C.cyan, fontSize: 12 }}>Text: {s.text}</p>}
                            </div>
                          );
                        })}
                      </Card>
                    )}

                    {/* HOOKS */}
                    {(result.hook || result.hook1) && (
                      <Card accent={C.gold + "44"} style={{ marginBottom: 14 }}>
                        <Label text="Viral Hooks - First 3 Seconds" />
                        {[result.hook || result.hook1, result.hookV2 || result.hook2, result.hookV3 || result.hook3].filter(Boolean).map(function(h, i) {
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, borderRadius: 8, padding: "9px 12px", marginBottom: 6 }}>
                              <p style={{ color: "#FCD34D", fontSize: 13, fontWeight: 600, flex: 1, marginRight: 8 }}>"{h}"</p>
                              <CopyBtn text={h} label="Copy" />
                            </div>
                          );
                        })}
                        {result.cta && <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>CTA: <span style={{ color: C.cyan }}>{result.cta}</span></p>}
                        {result.bestTime && <p style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Best time: <span style={{ color: C.white }}>{result.bestTime}</span></p>}
                      </Card>
                    )}

                    {/* CAPTIONS */}
                    {(result.caption || result.caption1) && (
                      <Card style={{ marginBottom: 14 }}>
                        <Label text="Caption Options" />
                        {[
                          result.caption || result.caption1,
                          result.captionV2 || result.caption2,
                          result.captionV3 || result.caption3,
                          result.caption4,
                        ].filter(Boolean).map(function(cap, i) {
                          return (
                            <div key={i} style={{ background: C.surface, borderRadius: 9, padding: "10px 12px", marginBottom: 8, borderLeft: "3px solid " + [C.pink, C.cyan, C.gold, C.green][i] }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ color: [C.pink, C.cyan, C.gold, C.green][i], fontSize: 10, fontWeight: 700 }}>Option {i + 1}</span>
                                <CopyBtn text={cap} label="Copy" />
                              </div>
                              <p style={{ color: C.white, fontSize: 13, lineHeight: 1.6 }}>{cap}</p>
                            </div>
                          );
                        })}
                      </Card>
                    )}

                    {/* HASHTAGS */}
                    {result.hashtags && (
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <Label text={"Hashtags (" + result.hashtags.length + ")"} />
                          <CopyBtn text={result.hashtags.map(function(h) { return "#" + h.replace(/^#/, ""); }).join(" ")} label="Copy all" />
                        </div>
                        {result.viralHashtags && (
                          <div style={{ marginBottom: 10 }}>
                            <p style={{ color: C.pink, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Top Viral Tags</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {result.viralHashtags.map(function(h) {
                                return <span key={h} onClick={function() { copyItem("vh" + h, "#" + h.replace(/^#/, "")); }} style={{ background: C.pink + "22", border: "1px solid " + C.pink + "44", borderRadius: 99, padding: "3px 9px", color: C.pink, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>#{h.replace(/^#/, "")}</span>;
                              })}
                            </div>
                          </div>
                        )}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {result.hashtags.map(function(h) {
                            return <span key={h} onClick={function() { copyItem("h" + h, "#" + h.replace(/^#/, "")); }} style={{ background: C.pink + "15", border: "1px solid " + C.pink + "33", borderRadius: 99, padding: "3px 9px", color: C.pink, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>#{h.replace(/^#/, "")}</span>;
                          })}
                        </div>
                      </Card>
                    )}

                    {/* IMAGE PROMPT */}
                    {result.imagePrompt && (
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <Label text="Image Prompt (Midjourney / DALL-E / Adobe Firefly)" />
                          <CopyBtn text={result.imagePrompt} />
                        </div>
                        <p style={{ color: C.white, fontSize: 13, lineHeight: 1.7 }}>{result.imagePrompt}</p>
                        {result.negativePrompt && <p style={{ color: C.dim, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>Avoid: {result.negativePrompt}</p>}
                      </Card>
                    )}

                    {/* ALGORITHM TIPS */}
                    {result.algorithmTip1 && (
                      <Card accent={C.cyan + "33"} style={{ marginBottom: 14 }}>
                        <Label text={pName + " Algorithm Tips"} />
                        {[result.algorithmTip1, result.algorithmTip2, result.algorithmTip3, result.algorithmTip4, result.algorithmTip5].filter(Boolean).map(function(t, i) {
                          return (
                            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                              <span style={{ color: C.cyan, fontWeight: 800, fontSize: 13, flexShrink: 0, width: 18 }}>{i + 1}.</span>
                              <span style={{ color: C.white, fontSize: 13, lineHeight: 1.5 }}>{t}</span>
                            </div>
                          );
                        })}
                      </Card>
                    )}

                    {/* 60 MIN STRATEGY */}
                    {result.postingStrategy && (
                      <Card accent={C.gold + "33"} style={{ marginBottom: 14 }}>
                        <Label text="60-Minute Viral Posting Strategy" />
                        <p style={{ color: C.white, fontSize: 13, lineHeight: 1.7 }}>{result.postingStrategy}</p>
                      </Card>
                    )}

                    {/* RESIZE GUIDE */}
                    {result.instagramPost && (
                      <Card style={{ marginBottom: 14 }}>
                        <Label text="Resize Guide for All Platforms" />
                        {[
                          { label: "Instagram Post", val: result.instagramPost },
                          { label: "Instagram Story", val: result.instagramStory },
                          { label: "Instagram Reel", val: result.instagramReel },
                          { label: "YouTube Thumbnail", val: result.youtubeThumb },
                          { label: "TikTok Video", val: result.tiktokVideo },
                          { label: "Facebook Post", val: result.facebookPost },
                          { label: "Twitter Card", val: result.twitterCard },
                          { label: "LinkedIn Post", val: result.linkedinPost },
                        ].filter(function(r) { return r.val; }).map(function(r) {
                          return (
                            <div key={r.label} style={{ display: "flex", gap: 10, background: C.surface, borderRadius: 8, padding: "9px 12px", marginBottom: 6 }}>
                              <span style={{ color: C.pink, fontWeight: 700, fontSize: 12, minWidth: 130 }}>{r.label}</span>
                              <span style={{ color: C.white, fontSize: 12, lineHeight: 1.5 }}>{r.val}</span>
                            </div>
                          );
                        })}
                      </Card>
                    )}

                    {/* COLOR PALETTE */}
                    {result.colorPalette && (
                      <Card style={{ marginBottom: 14 }}>
                        <Label text="Brand Color Palette" />
                        <div style={{ display: "flex", gap: 10 }}>
                          {result.colorPalette.map(function(col) {
                            return (
                              <div key={col} style={{ textAlign: "center" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 9, background: col, border: "1px solid " + C.border, marginBottom: 4 }}></div>
                                <p style={{ color: C.muted, fontSize: 10 }}>{col}</p>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDIO LOCKED */}
      {page === "studio" && !user && (
        <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div>
            <p style={{ fontSize: 40, marginBottom: 14 }}>🔒</p>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Sign in to use Studio</h2>
            <p style={{ color: C.muted, marginBottom: 20 }}>Create a free account to start generating.</p>
            <button onClick={function() { setAuthMode("signup"); setPage("auth"); }} style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: C.white, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Create free account</button>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && user && (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
              <p style={{ color: C.muted, fontSize: 14 }}>Welcome back, {user.name}</p>
            </div>
            <button onClick={function() { setPage("studio"); }} style={{ padding: "11px 22px", borderRadius: 10, background: "linear-gradient(90deg,#D946EF,#7C3AED)", border: "none", color: C.white, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>+ New Content</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Credits Left", val: credits, color: C.pink },
              { label: "Content Made", val: history.length, color: C.cyan },
              { label: "Platforms", val: 6, color: C.gold },
              { label: "Plan", val: "Free", color: C.green },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "18px 16px" }}>
                  <p style={{ color: s.color, fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em" }}>{s.val}</p>
                  <p style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Generated Content</p>
              <span style={{ color: C.muted, fontSize: 12 }}>{history.length} items</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <p style={{ color: C.muted, marginBottom: 14 }}>No content yet. Start creating!</p>
                <button onClick={function() { setPage("studio"); }} style={{ padding: "10px 20px", borderRadius: 9, background: C.pink + "22", border: "1px solid " + C.pink + "44", color: C.pink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Go to Studio</button>
              </div>
            ) : (
              history.map(function(h) {
                var t = TOOLS.find(function(t2) { return t2.id === h.tool; });
                var p = PLATFORMS.find(function(p2) { return p2.id === h.platform; });
                return (
                  <div key={h.id} onClick={function() { setResult(h.result); setTool(h.tool); setPrompt(h.prompt); setPage("studio"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid " + C.border, cursor: "pointer" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: C.pink + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.pink, fontWeight: 800, fontSize: 10 }}>{t?.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: C.white, fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.prompt || t?.label}</p>
                      <p style={{ color: C.muted, fontSize: 11 }}>{t?.label} - {p?.name}</p>
                    </div>
                    <p style={{ color: C.dim, fontSize: 11 }}>{new Date(h.id).toLocaleDateString()}</p>
                    <button style={{ padding: "5px 12px", borderRadius: 7, background: C.pink + "22", border: "1px solid " + C.pink + "44", color: C.pink, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Open</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
