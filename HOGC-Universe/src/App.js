import { useState, useEffect, useCallback, useMemo, memo } from "react";
import "./index.css";
import hogcLogo from "./Hogc.png";

function makeLogoTransparent(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        // If pixel is dark (background), make transparent
        if (r < 30 && g < 30 && b < 30) d[i+3] = 0;
      }
      ctx.putImageData(data, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = src;
  });
}




// ─── Planet generator helpers ─────────────────────────────────────────────────
function rng(s){let n=s>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
function noise(W,H,freq,r){const gw=Math.ceil(W*freq)+2,gh=Math.ceil(H*freq)+2;const g=new Float32Array(gw*gh);for(let i=0;i<g.length;i++)g[i]=r()*2-1;const out=new Float32Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const fx=x*freq,fy=y*freq;const ix=Math.floor(fx)|0,iy=Math.floor(fy)|0;let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const I=(xi,yi)=>((yi%gh+gh)%gh)*gw+((xi%gw+gw)%gw);out[y*W+x]=g[I(ix,iy)]*(1-tx)*(1-ty)+g[I(ix+1,iy)]*tx*(1-ty)+g[I(ix,iy+1)]*(1-tx)*ty+g[I(ix+1,iy+1)]*tx*ty;}return out;}
function fbm(W,H,oct,r,baseFreq=0.005){const out=new Float32Array(W*H);let a=.5,f=baseFreq,t=0;for(let o=0;o<oct;o++){const n=noise(W,H,f,r);for(let i=0;i<out.length;i++)out[i]+=n[i]*a;t+=a;a*=.5;f*=2.1;}for(let i=0;i<out.length;i++)out[i]=out[i]/t*.5+.5;return out;}
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const lx=(a,b,t)=>a+(b-a)*t;
const lc=(a,b,t)=>[lx(a[0],b[0],t),lx(a[1],b[1],t),lx(a[2],b[2],t)];
const sm=(e0,e1,x)=>{x=cl((x-e0)/(e1-e0),0,1);return x*x*(3-2*x);};
function px(d,i,r,g,b){d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}
function mkTex(W,H,fn){const c=document.createElement("canvas");c.width=W;c.height=H;const ctx=c.getContext("2d"),img=ctx.createImageData(W,H);fn(img.data,W,H);ctx.putImageData(img,0,0);return c.toDataURL("image/jpeg",.92);}
const TW=800,TH=400;
function mkMercury(){const r=rng(11),base=fbm(TW,TH,6,r,.004),det=fbm(TW,TH,4,rng(12),.018);const crat=[];for(let i=0;i<200;i++){const sz=r()*r()*20+1.5;crat.push([r()*TW,r()*TH,sz,r()]);}return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){let n=base[y*TW+x]*.6+det[y*TW+x]*.4,cv=0,rim=0;for(const[cx,cy,cr]of crat){const dist=Math.sqrt((x-cx)**2+(y-cy)**2);if(dist<cr){const t=1-dist/cr;cv=Math.max(cv,t*.35);if(dist>cr*.7)rim=Math.max(rim,(t-.3)/.7*.15);}}n=cl(n-cv+rim*.5,0,1);const dark=[.22,.18,.15],mid=[.48,.42,.36],light=[.66,.60,.53],warm=[.72,.62,.48];let col=n<.35?lc(dark,mid,n/.35):n<.70?lc(mid,light,(n-.35)/.35):lc(light,warm,(n-.70)/.30);const patch=base[y*TW+x];if(patch>.62)col=lc(col,[.74,.62,.44],sm(.62,.78,patch)*.4);px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}
function mkVenus(){const r=rng(21),band=fbm(TW,TH,6,r,.003),swirl=fbm(TW,TH,5,rng(22),.008),fine=fbm(TW,TH,3,rng(23),.025);return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const lat=(y/TH-.5)*Math.PI;const bv=Math.sin(lat*9+band[y*TW+x]*5+swirl[y*TW+x]*2.5)*.5+.5;const n=cl(bv*.50+swirl[y*TW+x]*.30+fine[y*TW+x]*.20,0,1);const c1=[.35,.18,.04],c2=[.60,.38,.10],c3=[.80,.58,.20],c4=[.92,.78,.40],c5=[.97,.90,.60];let col;if(n<.20)col=lc(c1,c2,n/.20);else if(n<.45)col=lc(c2,c3,(n-.20)/.25);else if(n<.70)col=lc(c3,c4,(n-.45)/.25);else if(n<.88)col=lc(c4,c5,(n-.70)/.18);else col=lc(c5,[1,.97,.80],(n-.88)/.12);px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}
function mkMars(){const r=rng(41),base=fbm(TW,TH,7,r,.004),fine=fbm(TW,TH,4,rng(42),.016),dust=fbm(TW,TH,3,rng(43),.008);return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const lat=Math.abs((y/TH-.5)*2);let n=cl(base[y*TW+x]*.55+fine[y*TW+x]*.25+dust[y*TW+x]*.20,0,1);const rust=[.42,.14,.05],orange=[.70,.28,.08],ochre=[.80,.44,.16],tan=[.78,.58,.30],light=[.84,.68,.42];let col;if(n<.20)col=lc(rust,orange,n/.20);else if(n<.45)col=lc(orange,ochre,(n-.20)/.25);else if(n<.70)col=lc(ochre,tan,(n-.45)/.25);else col=lc(tan,light,(n-.70)/.30);col=lc(col,[.90,.86,.84],sm(.76,.95,lat));const vx=x/TW,vy=y/TH;if(vy>.42&&vy<.60&&vx>.25&&vx<.75){const vm=sm(.42,.50,vy)*sm(.60,.52,vy)*sm(.25,.35,vx)*sm(.75,.65,vx);col=lc(col,[.28,.09,.03],vm*base[y*TW+x]*.6);}const ox=(vx-.18)**2*8+(vy-.38)**2*12;if(ox<.04)col=lc(col,[.86,.72,.48],sm(.04,0,ox)*.5);px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}
function mkJupiter(){const r=rng(51),turb=fbm(TW,TH,7,r,.004),wave=fbm(TW,TH,5,rng(52),.010),micro=fbm(TW,TH,3,rng(53),.030);return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const lat=(y/TH-.5)*2;const b1=Math.sin(lat*20*Math.PI+turb[y*TW+x]*6)*.5+.5;const b2=Math.sin(lat*8*Math.PI+wave[y*TW+x]*3+.4)*.5+.5;const n=cl(b1*.50+b2*.30+micro[y*TW+x]*.20,0,1);const darkbrown=[.35,.18,.08],brown=[.55,.30,.12],orange=[.78,.46,.18],cream=[.88,.78,.56],pale=[.92,.86,.68],white=[.96,.92,.80];let col;if(n<.15)col=lc(darkbrown,brown,n/.15);else if(n<.35)col=lc(brown,orange,(n-.15)/.20);else if(n<.55)col=lc(orange,cream,(n-.35)/.20);else if(n<.75)col=lc(cream,pale,(n-.55)/.20);else if(n<.90)col=lc(pale,white,(n-.75)/.15);else col=lc(white,cream,(n-.90)/.10);const gx=(x/TW-.60)*3.5,gy=(y/TH-.62)*7;const gd=gx*gx+gy*gy;if(gd<1){const grs_core=sm(1,.3,gd);const grs_rim=sm(.6,.8,Math.sqrt(gd))*sm(1.0,.7,Math.sqrt(gd));col=lc(col,[.72,.18,.08],grs_core*.85);col=lc(col,[.88,.52,.28],grs_rim*.6);}if(lat>-.10&&lat<.08){const fest=Math.sin(x/TW*12*Math.PI+turb[y*TW+x]*4)*.5+.5;col=lc(col,[.42,.22,.10],fest*micro[y*TW+x]*.35);}px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}
function mkSaturn(){const r=rng(61),band=fbm(TW,TH,6,r,.003),fine=fbm(TW,TH,3,rng(62),.015),turb=fbm(TW,TH,4,rng(63),.008);return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const lat=(y/TH-.5)*2;const bv=Math.sin(lat*24*Math.PI+band[y*TW+x]*3+turb[y*TW+x])*.5+.5;const n=cl(bv*.60+fine[y*TW+x]*.25+turb[y*TW+x]*.15,0,1);const deep=[.42,.30,.14],gold=[.68,.50,.24],honey=[.84,.68,.36],pale=[.94,.84,.58],cream=[.97,.92,.72];let col;if(n<.20)col=lc(deep,gold,n/.20);else if(n<.45)col=lc(gold,honey,(n-.20)/.25);else if(n<.70)col=lc(honey,pale,(n-.45)/.25);else if(n<.88)col=lc(pale,cream,(n-.70)/.18);else col=lc(cream,pale,(n-.88)/.12);if(Math.abs(lat)>.80){const hex=sm(.80,.95,Math.abs(lat));col=lc(col,[.38,.28,.16],hex*.3);}px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}
function mkUranus(){const r=rng(71),haze=fbm(TW,TH,4,r,.004),fine=fbm(TW,TH,3,rng(72),.015);return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const lat=Math.abs((y/TH-.5)*2);const bv=Math.sin((y/TH-.5)*2*6*Math.PI+haze[y*TW+x]*1.5)*.5+.5;const n=cl(bv*.45+haze[y*TW+x]*.35+fine[y*TW+x]*.20,0,1);const deep=[.06,.32,.42],teal=[.18,.56,.64],cyan=[.38,.76,.80],pale=[.58,.88,.88],white=[.78,.94,.94];let col;if(n<.25)col=lc(deep,teal,n/.25);else if(n<.55)col=lc(teal,cyan,(n-.25)/.30);else if(n<.80)col=lc(cyan,pale,(n-.55)/.25);else col=lc(pale,white,(n-.80)/.20);col=lc(col,[.04,.22,.32],sm(.70,.95,lat)*.5);px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}
function mkNeptune(){const r=rng(81),bands=fbm(TW,TH,6,r,.004),storm=fbm(TW,TH,5,rng(82),.010),wisp=fbm(TW,TH,3,rng(83),.022);return mkTex(TW,TH,(d)=>{for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const lat=(y/TH-.5)*2;const bv=Math.sin(lat*16*Math.PI+bands[y*TW+x]*5+storm[y*TW+x]*2)*.5+.5;const n=cl(bv*.55+storm[y*TW+x]*.30+wisp[y*TW+x]*.15,0,1);const midnight=[.02,.05,.35],royal=[.06,.18,.62],cobalt=[.14,.36,.84],bright=[.22,.52,.95],cyan=[.34,.70,1.0];let col;if(n<.20)col=lc(midnight,royal,n/.20);else if(n<.45)col=lc(royal,cobalt,(n-.20)/.25);else if(n<.70)col=lc(cobalt,bright,(n-.45)/.25);else col=lc(bright,cyan,(n-.70)/.30);const gx=(x/TW-.35)*3,gy=(y/TH-.40)*6;const gd=gx*gx+gy*gy;if(gd<1)col=lc(col,[.01,.03,.20],sm(1,0,gd)*.80);const sx=(x/TW-.65)*5,sy=(y/TH-.42)*8;if(sx*sx+sy*sy<.15)col=lc(col,[.85,.92,1.0],sm(.15,0,sx*sx+sy*sy)*.80);const wv=sm(.58,.72,wisp[y*TW+x]);if(Math.abs(lat)<.35&&wv>.5)col=lc(col,[.80,.90,1.0],(wv-.5)*2*.55);px(d,(y*TW+x)*4,col[0]*255,col[1]*255,col[2]*255);}});}

// ─── Data ─────────────────────────────────────────────────────────────────────
export const CARDS = [
  [
    "Velocity-grade infrastructure",
    "AI-powered decision engine",
    "Real-time market signals",
    "Zero-latency data pipeline",
  ],
  [
    "Digital Transformation & Platforms | End-to-end digital transformation, custom software, and scalable business systems",
    "AI, Data & Intelligence | AI solutions, predictive analytics, and data engineering for smarter decisions",
    "Automation & Business Systems | Workflow automation, CRM/ERP solutions, and process optimization systems",
    "Cloud, Security & Infrastructure | Cloud infrastructure, DevOps, cybersecurity, and high-performance architecture",
  ],
  [
    "Talent & Hiring | Talent sourcing, recruitment, and candidate management solutions",
    "HR & People Operations | End-to-end HR services, compliance, and workforce management",
    "Contract Workforce | Skilled contract manpower and workforce augmentation services",
    "Workspace & Office Setup | Office setup, infrastructure provisioning, and workspace aggregation solutions",
  ],
  [
    "Brand & Strategy | Brand strategy, positioning, and integrated marketing systems",
    "Lead Generation & Growth | Lead generation, funnels, and conversion optimization systems",
    "Digital & Performance Marketing | Digital marketing, social media, and performance marketing campaigns",
    "Content & Creative Strategy | Storytelling, creative direction, and content systems that build audience engagement",
  ],
  [
    "Vehicle Care | Precision exterior and interior care in residential ecosystem",
    "EV Infrastructure | Integrated EV charging within residential ecosystems",
    "Smart Access | App-based scheduling and seamless service access",
    "Extended Care | On-demand servicing and certified vehicle support",
  ],
  [
    "PropTech valuation engine",
    "Smart portfolio analytics",
    "Location intelligence data",
    "Asset lifecycle management",
  ],
  [
    "Frictionless travel booking",
    "Personalised itinerary AI",
    "Loyalty rewards engine",
    "Multi-modal route planner",
  ],
  [
    "Venture signal detection",
    "Startup growth analytics",
    "Founder network mapping",
    "Early-stage deal flow",
  ],
];

export const SOLAR = [
  {id:"mercury",label:"Planet", name:"HOGC Enterprises",  tag:"Built as individual worlds. Connected as one universe.", url:"https://tracxn.com/",gen:mkMercury,texUrl:"https://www.solarsystemscope.com/images/textures/full/2k_mercury.jpg",       glow:"rgba(200,158,118,.42)",speed:"30s",bs:"0 0 65px rgba(188,143,127,.55)",au:"0.39 AU"},
  {id:"venus",   label:"Planet", name:"GC Tech",           tag:"Where technology meets business evolution.",             url:"https://gc-tech.onslate.in",gen:mkVenus,texUrl:"https://www.solarsystemscope.com/images/textures/full/2k_venus_surface.jpg",glow:"rgba(255,195,80,.40)", speed:"36s",bs:"0 0 65px rgba(200,130,20,.60)", au:"0.723 AU"},
  {id:"earth",   label:"Planet", name:"SapienSync",        tag:"Powering businesses with people and infrastructure.",    url:"https://sapiensync.hogc.in/",gen:null,     texUrl:"https://res.cloudinary.com/dshmwg7vw/image/upload/v1551102200/earthnight2.jpg",glow:"rgba(100,160,255,.42)",speed:"20s",bs:"0 0 65px rgba(100,150,255,.60)",au:"1 AU"},
  {id:"mars",    label:"Planet", name:"GC Marketing",      tag:"Where businesses become brands.",                        url:"https://nimble-paprenjak-692e82.netlify.app/",gen:mkMars,   texUrl:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/mars_texture.jpg",       glow:"rgba(220,75,35,.42)",  speed:"26s",bs:"0 0 65px rgba(200,75,35,.60)",   au:"1.524 AU"},
  {id:"jupiter", label:"Planet", name:"Autotown",          tag:"Architects of intelligent mobility.",                    url:"https://charming-genie-25f447.netlify.app/",gen:mkJupiter,texUrl:"https://www.solarsystemscope.com/images/textures/full/2k_jupiter.jpg",       glow:"rgba(210,165,90,.40)", speed:"12s",bs:"0 0 65px rgba(200,148,75,.55)", au:"5.203 AU"},
  {id:"connect", label:"",       name:"Connect",           tag:"Let's start a conversation.",                            url:"",gen:null,texUrl:null,glow:"rgba(254,160,130,.25)",speed:null,bs:null,au:"\u221e"},
];

// ─── Stars ────────────────────────────────────────────────────────────────────
function generateStars() {
  const stars = [];
  for (let i = 0; i < 90; i++) {
    stars.push({ id:`s${i}`, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      width:`${Math.random()*2.5+.8}px`, height:`${Math.random()*2.5+.8}px`,
      delay:`${Math.random()*6}s`, duration:`${2+Math.random()*4}s`, twinkle:true });
  }
  for (let i = 0; i < 240; i++) {
    const sz = `${Math.random()*1.4+.3}px`;
    stars.push({ id:`sf${i}`, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      width:sz, height:sz, opacity:Math.random()*.5+.06, twinkle:false });
  }
  return stars;
}
const STARS = generateStars();

// ─── Card content renderer ────────────────────────────────────────────────────
function CardContent({ text }) {
  if (!text) return null;
  const pipeIdx = text.indexOf(" | ");
  if (pipeIdx === -1) return <div className="pcard-title">{text}</div>;
  return (
    <>
      <div className="pcard-title">{text.slice(0, pipeIdx)}</div>
      <div className="pcard-sub">{text.slice(pipeIdx + 3)}</div>
    </>
  );
}

// ─── ConnectForm ──────────────────────────────────────────────────────────────
function ConnectForm() {
  const [form, setForm] = useState({name:"",email:"",company:"",message:""});
  const [shake, setShake]     = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
// submit api 
  const handleSubmit = async () => {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    setShake(true); setTimeout(() => setShake(false), 500); return;
  }
  setSending(true);

  try {
    const response = await fetch( `${process.env.REACT_APP_API_URL}/server/emailleadcollector/contact`,
 {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: form.name.trim(),
    email: form.email.trim(),
    phone_no: "",
    source: form.company.trim() || "HOGC Website",
  }),
});

    const data = await response.json();

    if (response.ok) {
      setSending(false);
      setSent(true);
    } else {
      setSending(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      console.error("API error:", data.message);
    }
  } catch (err) {
    setSending(false);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    console.error("Network error:", err);
  }
};

  if (sent) return (
    <div id="stage-form">
      <div className="sf-eyebrow">Get in Touch</div>
      <h2 className="sf-title">Connect</h2>
      <p className="sf-sub">Let's start a conversation.</p>
      <p className="sf-success visible">Message sent — we'll be in touch soon.</p>
    </div>
  );

  return (
    <div id="stage-form">
      <div className="sf-eyebrow">Get in Touch</div>
      <h2 className="sf-title">Connect</h2>
      <p className="sf-sub">Let's start a conversation.</p>
      <div className="sf-fields">
        <div className="sf-row">
          <div className="sf-field">
            <label className="sf-label">Name <span className="sf-req">*</span></label>
            <input className="sf-input" type="text" placeholder="Your name" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div className="sf-field">
            <label className="sf-label">Email <span className="sf-req">*</span></label>
            <input className="sf-input" type="email" placeholder="you@company.com" value={form.email}
              onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          </div>
        </div>
        <div className="sf-row">
          <div className="sf-field">
            <label className="sf-label">Company <span className="sf-opt">optional</span></label>
            <input className="sf-input" type="text" placeholder="Your company" value={form.company}
              onChange={e=>setForm(f=>({...f,company:e.target.value}))}/>
          </div>
          <div className="sf-field">
            <label className="sf-label">Description <span className="sf-req">*</span></label>
            <textarea className="sf-input sf-textarea" placeholder="Tell us about your project…" rows={2}
              value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/>
          </div>
        </div>
        <button className={`sf-submit${shake?" sf-shake":""}`} disabled={sending} onClick={handleSubmit}>
          <span className="sf-submit-text">{sending?"Sending…":"Send Message"}</span>
          <span className="sf-submit-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

// ─── ArrowsSVG ────────────────────────────────────────────────────────────────
function ArrowsSVG({ cur, cardsReady, lines }) {
  const isConnect = cur === SOLAR.length - 1;
  return (
    <svg id="arrows-svg" className={cardsReady && !isConnect ? "show" : ""}>
      <defs>
        <marker id="arrowTip" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <circle cx="2" cy="2" r="1.5" fill="#fea082" opacity="0.8"/>
        </marker>
      </defs>
      {["tl","tr","bl","br"].map(id => (
        <line key={id} id={`line-${id}`}
          x1={lines[id]?.x1||0} y1={lines[id]?.y1||0}
          x2={lines[id]?.x2||0} y2={lines[id]?.y2||0}
          stroke="rgba(254,160,130,0.45)" strokeWidth="0.8" strokeDasharray="3,3"
          markerEnd="url(#arrowTip)"/>
      ))}
    </svg>
  );
}

// ─── PlanetSlide — memoized so it NEVER re-renders on parent state changes ───
// Only re-renders when its own props (isActive, planetStyle) change
const PlanetSlide = memo(function PlanetSlide({ p, isActive, planetStyle }) {
  return (
    <div className={`pw${isActive ? " on" : ""}`} style={{"--glow": p.glow}}>
      {p.id === "connect" ? <ConnectForm/> : (
        <>
          {p.id === "saturn" && <div className="ring"/>}
          <div className="planet-shell" style={{boxShadow: p.bs}}>
            <div className="planet-tex" style={planetStyle}/>
          </div>
        </>
      )}
    </div>
  );
});

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [cur, setCur]             = useState(0);
  const [busy, setBusy]           = useState(false);
  const [hintDone, setHintDone]   = useState(false);
  const [loadPct, setLoadPct]     = useState(0);
  const [loadName, setLoadName]   = useState("Mapping the universe…");
  const [loaded, setLoaded]       = useState(false);
  const [panelShow, setPanelShow] = useState(false);
  const [panelExit, setPanelExit] = useState(false);
  const [cardsShow, setCardsShow] = useState(false);
  const [navShow, setNavShow]     = useState(false);
  const [navOpen, setNavOpen]     = useState(false);
  const [flash, setFlash]         = useState(false);
  const [textures, setTextures]   = useState({});
  const [navTextures, setNavTex]  = useState({});
  const [lines, setLines]         = useState({tl:{},tr:{},bl:{},br:{}});
  const [logoSrc, setLogoSrc]     = useState(hogcLogo); 

  useEffect(() => {
    makeLogoTransparent(hogcLogo).then(setLogoSrc);
  }, []);

 

  const isMobile = () => window.innerWidth <= 700;
  const isConnect = cur === SOLAR.length - 1;
  const panelData = isConnect ? null : SOLAR[cur];

  useEffect(() => {
    if (isConnect) {
      document.documentElement.classList.add("stage-connect");
      document.body.classList.add("stage-connect");
    } else {
      document.documentElement.classList.remove("stage-connect");
      document.body.classList.remove("stage-connect");
    }
  }, [isConnect]);

  useEffect(() => {
    if (!isMobile()) return;
    if (isConnect) {
      document.documentElement.style.touchAction = "pan-y";
      document.body.style.touchAction = "pan-y";
      document.body.style.overflow = "hidden";
      const stage = document.getElementById("stage");
      if (stage) { stage.style.overflowY="auto"; stage.style.overflowX="hidden"; stage.style.webkitOverflowScrolling="touch"; }
    } else {
      document.documentElement.style.touchAction = "none";
      document.body.style.touchAction = "none";
      const stage = document.getElementById("stage");
      if (stage) { stage.style.overflowY=""; stage.style.overflowX=""; }
    }
  }, [isConnect]);

  // ── Loader ────────────────────────────────────────────────────────────────
  useEffect(() => {
  // Animate progress bar smoothly over ~1.8s regardless of actual load
  const FAKE_DURATION = 1800;
  const start = Date.now();
  let rafId;
  const animatePct = () => {
    const elapsed = Date.now() - start;
    const frac = Math.min(elapsed / FAKE_DURATION, 0.92); // cap at 92% until real done
    setLoadPct(Math.round(frac * 100));
    if (frac < 0.92) rafId = requestAnimationFrame(animatePct);
  };
  rafId = requestAnimationFrame(animatePct);

  const finish = () => {
    cancelAnimationFrame(rafId);
    setLoadPct(100); setLoadName("Ready");
    setTimeout(() => {
      setLoaded(true);
      setTimeout(() => {
        setPanelShow(true); setCardsShow(true);
        setNavShow(true); setTimeout(updateArrows, 100);
      }, 500);
    }, 200);
  };

  // Load ALL remote textures in parallel
  const promises = SOLAR.map((pd) => new Promise((resolve) => {
    if (!pd.texUrl && !pd.gen) { resolve({ id: pd.id, url: null }); return; }
    if (!pd.texUrl && pd.gen) {
      // Canvas-gen: defer after load screen
      resolve({ id: pd.id, url: null });
      requestIdleCallback(() => {
        const url = pd.gen();
        setTextures(t => ({ ...t, [pd.id]: { url, aspect: 2 } }));
        setNavTex(t => ({ ...t, [pd.id]: { url, aspect: 2 } }));
      });
      return;
    }
    setLoadName(`Loading ${pd.name}…`);
    const img = new Image();
    img.onload = () => resolve({ id: pd.id, url: pd.texUrl, aspect: img.naturalWidth / img.naturalHeight });
    img.onerror = () => {
      if (pd.gen) requestIdleCallback(() => {
        const url = pd.gen();
        setTextures(t => ({ ...t, [pd.id]: { url, aspect: 2 } }));
        setNavTex(t => ({ ...t, [pd.id]: { url, aspect: 2 } }));
      });
      resolve({ id: pd.id, url: null });
    };
    img.src = pd.texUrl;
  }));

  Promise.all(promises).then((results) => {
    const texMap = {}, navMap = {};
    results.forEach(({ id, url, aspect }) => {
      if (url) { texMap[id] = { url, aspect }; navMap[id] = { url, aspect }; }
    });
    setTextures(t => ({ ...t, ...texMap }));
    setNavTex(t => ({ ...t, ...navMap }));
    finish();
  });

  return () => cancelAnimationFrame(rafId);
}, []); // eslint-disable-line// eslint-disable-line

  // ── Arrow recalculation ───────────────────────────────────────────────────
  const updateArrows = useCallback(() => {
    const NAV_W = isMobile() ? 0 : 230;
    const stageW = window.innerWidth - NAV_W;
    const cx = NAV_W + stageW/2;
    const cy = window.innerHeight/2 - window.innerHeight*0.05;
    const r  = Math.min(stageW, window.innerHeight)*0.28;
    const pts = {
      tl:{px:cx-r*.72,py:cy-r*.72}, tr:{px:cx+r*.72,py:cy-r*.72},
      bl:{px:cx-r*.72,py:cy+r*.55}, br:{px:cx+r*.72,py:cy+r*.55},
    };
    ["tl","tr","bl","br"].forEach(id => {
      const dot = document.getElementById(`dot-${id}`);
      if (!dot) return;
      const db = dot.getBoundingClientRect();
      setLines(prev=>({...prev,[id]:{x1:db.left+db.width/2,y1:db.top+db.height/2,x2:pts[id].px,y2:pts[id].py}}));
    });
  }, []);

  // ── Memoized styles — only recompute when textures change (during load only) 
  const planetStyles = useMemo(() => {
    return SOLAR.map((p) => {
      const tex = textures[p.id];
      if (!tex) return {};
      const aspect = tex.aspect || 2;
      const texW = `calc(var(--ps) * ${aspect.toFixed(4)})`;
      return {
        backgroundImage: `url("${tex.url}")`,
        backgroundSize: `${texW} var(--ps)`,
        backgroundRepeat: "repeat-x",
        width: texW,
        animationDuration: p.speed,
      };
    });
  }, [textures]);

  const navStyles = useMemo(() => {
    return SOLAR.map((p) => {
      const t = navTextures[p.id];
      if (!t) return {};
      return {
        backgroundImage: `url("${t.url}")`,
        backgroundSize: `${Math.round(38 * t.aspect)}px 38px`,
        width: `${Math.round(38 * t.aspect)}px`,
        backgroundRepeat: "repeat-x",
        animationDuration: p.speed,
      };
    });
  }, [navTextures]);

  useEffect(() => {
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = useCallback((i) => {
    if (i < 0 || i > SOLAR.length - 1 || busy) return;
    setHintDone(true); setBusy(true);

    setFlash(true); setTimeout(() => setFlash(false), 260);

    setPanelShow(false);
    setCardsShow(false);

    requestAnimationFrame(() => {
      setTimeout(() => {
        setCur(i);
        if (i === SOLAR.length - 1) {
          setTimeout(() => setBusy(false), 900);
        } else {
          setTimeout(() => setPanelShow(true), 300);
          setTimeout(() => { setCardsShow(true); updateArrows(); }, 420);
          setTimeout(() => setBusy(false), 900);
        }
      }, 16);
    });

    if (isMobile()) setNavOpen(false);
  }, [busy, updateArrows]);

  useEffect(() => {
    const onKey = e => {
      if (e.key==="ArrowDown"||e.key===" "){goTo(cur+1);e.preventDefault();}
      if (e.key==="ArrowUp"){goTo(cur-1);e.preventDefault();}
    };
    let ty0=0,tx0=0,wl=false;
    const onTS = e=>{ty0=e.touches[0].clientY;tx0=e.touches[0].clientX;};
    const onTE = e=>{
      const st=document.elementFromPoint(tx0,ty0);
      if(st?.closest('#stage-form')&&(st.tagName==='INPUT'||st.tagName==='TEXTAREA'||st.isContentEditable))return;
      const dy=ty0-e.changedTouches[0].clientY,dx=Math.abs(tx0-e.changedTouches[0].clientX);
      if(Math.abs(dy)<45||dx>Math.abs(dy)*.85)return;
      dy>0?goTo(cur+1):goTo(cur-1);
    };
    const onWheel=e=>{if(wl)return;wl=true;e.deltaY>0?goTo(cur+1):goTo(cur-1);setTimeout(()=>wl=false,900);};
    document.addEventListener("keydown",onKey);
    document.addEventListener("touchstart",onTS,{passive:true});
    document.addEventListener("touchend",onTE,{passive:true});
    document.addEventListener("wheel",onWheel,{passive:true});
    return()=>{
      document.removeEventListener("keydown",onKey);
      document.removeEventListener("touchstart",onTS);
      document.removeEventListener("touchend",onTE);
      document.removeEventListener("wheel",onWheel);
    };
  }, [cur,goTo,isConnect]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div id="space">
        {STARS.map(s=>(
          <div key={s.id} className="star" style={{
            left:s.left,top:s.top,width:s.width,height:s.height,
            ...(s.twinkle?{animationDelay:s.delay,animationDuration:s.duration}:{opacity:s.opacity,animation:"none"})
          }}/>
        ))}
      </div>

      <div id="loader" className={loaded?"out":""}>
        <img src={logoSrc} alt="HOGC" className="hogc-logo" style={{width:160,height:"auto",marginBottom:6}}/>
        <div className="ld-track"><div className="ld-fill" style={{width:`${loadPct}%`}}/></div>
        <div className="ld-pct">{loadPct}%</div>
        <div className="ld-name">{loadName}</div>
      </div>

      {/* ── Planets: each is memoized — only fades in/out, never fully re-renders ── */}
      <div id="stage" className={isConnect?"stage-connect":""}>
        {SOLAR.map((p, i) => (
          <PlanetSlide
            key={p.id}
            p={p}
            isActive={i === cur}
            planetStyle={planetStyles[i] || {}}
          />
        ))}
      </div>

      <div id="vignette"/>
      <div id="flash" className={flash?"pop":""}/>

      {/* Planet info cards */}
      <div id="planet-cards" className={cardsShow&&!isConnect&&cur!==0?"show":""} style={isConnect?{opacity:0}:{}}>
        {["tl","tr","bl","br"].map(pos=>{
          const cards=CARDS[cur]||CARDS[0];
          const idx={tl:0,tr:1,bl:2,br:3}[pos];
          const isRight=pos==="tr"||pos==="br";
          return (
            <div key={pos} className={`pcard ${pos}`}>
              {isRight&&<div className="pcard-dot" id={`dot-${pos}`}/>}
              <div className="pcard-box">
                <div className="pcard-num">{String(idx+1).padStart(2,"0")}</div>
                <CardContent text={cards[idx]}/>
              </div>
              {!isRight&&<div className="pcard-dot" id={`dot-${pos}`}/>}
            </div>
          );
        })}
      </div>

      <ArrowsSVG cur={cur} cardsReady={cardsShow && cur !== 0} lines={lines}/>

      <div id="nav-backdrop" className={navOpen?"show":""} onClick={()=>setNavOpen(false)}/>

      <div id="left-nav" className={`${navShow?"show":""} ${navOpen?"nav-open":""}`}>
        <div id="nav-logo">
          <img src={logoSrc} alt="HOGC" className="hogc-logo" style={{width:130,height:"auto"}}/>
        </div>
        <div id="nav-list">
          {SOLAR.map((p,idx)=>(
            <div key={p.id}>
              {idx>0&&<div className="nav-sep"/>}
              <button className={`nav-planet${cur===idx?" active":""}`} onClick={()=>goTo(idx)}>
                <div className="nav-ring"><div className="nav-dot"/></div>
                <div className="nav-sphere-wrap">
                  {navStyles[idx] && Object.keys(navStyles[idx]).length > 0
                    ? <div className="nav-sphere-tex" style={navStyles[idx]}/>
                    : <div className="nav-sphere-tex"/>
                  }
                </div>
                <div className="nav-info">
                  <div className="nav-label">{p.name}</div>
                  <div className="nav-dist">{p.au}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div id="topbar">
        <button id="burger" className={navOpen?"open":""} onClick={()=>setNavOpen(o=>!o)}>
          <span/><span/><span/>
        </button>
        <div id="topbar-logo">
          <img src={logoSrc} alt="HOGC" className="hogc-logo" style={{height:26,width:"auto"}}/>
        </div>
        <div id="counter">{String(cur+1).padStart(2,"0")} / 0{SOLAR.length}</div>
      </div>

      <div id="nav-dots">
        {SOLAR.map((p,i)=>(
          <div key={p.id} className={`ndot${cur===i?" on":""}`} onClick={()=>goTo(i)}/>
        ))}
      </div>

      {!isConnect && cur !== 0 && (
        <div id="panel" className={`${panelShow?"show":""} ${panelExit?"panel-exit":""}`}>
          <div className="p-label">{panelData?.label}</div>
          <div className="p-name">{panelData?.name}</div>
          <div className="p-tag">{panelData?.tag}</div>
          {panelData?.url&&(
            <button className="p-btn" onClick={()=>window.open(panelData.url,"_blank")}>Read More</button>
          )}
        </div>
      )}

      {cur === 0 && loaded && (
        <div id="hero-center" className={panelShow ? "show" : ""}>
          <div className="p-label">Universe</div>
          <div className="p-name">House of Giovanni Corsi</div>
          <div className="hero-tag">A curated ecosystem of ventures</div>
          <div className="p-subtag">Built as individual worlds. Connected as one universe.</div>
          <div className="hero-scroll">
            <span className="hero-scroll-text">Swipe to enter the orbit</span>
            <div className="hero-arrow"><span/><span/></div>
          </div>
        </div>
      )}

      
    </>
  );
}