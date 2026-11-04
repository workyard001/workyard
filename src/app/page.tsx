import { ArrowRight, BadgeCheck, BriefcaseBusiness, CheckCircle2, MapPin, Search, ShieldCheck, Users, Wrench } from "lucide-react";

const workers = [
  { name: "Adebayo O.", skill: "Plumber", area: "Akungba-Akoko", lga: "Akoko South-West", price: "₦5,000–₦15,000", initials: "AO", tone: "mint", verified: true, rating: "4.9" },
  { name: "Chinwe N.", skill: "Hair stylist", area: "Oka-Akoko", lga: "Akoko South-West", price: "₦3,000–₦8,000", initials: "CN", tone: "peach", verified: true, rating: "4.8" },
  { name: "Musa I.", skill: "Electrician", area: "Ikare-Akoko", lga: "Akoko North-East", price: "₦7,000–₦20,000", initials: "MI", tone: "blue", verified: true, rating: "5.0" },
  { name: "Blessing A.", skill: "Cleaner", area: "Akungba-Akoko", lga: "Akoko South-West", price: "₦4,000–₦10,000", initials: "BA", tone: "yellow", verified: false, rating: "New" }
];
const skills = ["All skills", "Plumber", "Electrician", "Carpenter", "Cleaner", "Hair stylist", "Painter"];

export default function Home() {
  return <main>
    <header className="nav wrap">
      <a className="brand" href="#"><span className="brand-mark"><MapPin size={18}/><Wrench size={17}/></span><span>WORK<span>YARD</span></span></a>
      <nav><a href="#how">How it works</a><a href="#workers">Find workers</a><a href="#vision">Our vision</a></nav>
      <div className="nav-actions"><a className="login" href="#join">Log in</a><a className="btn btn-small" href="#join">Join WORKYARD <ArrowRight size={15}/></a></div>
    </header>

    <section className="hero wrap">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse"/> LOCAL WORK. REAL TRUST.</div>
        <h1>Find trusted hands<br/>for <span>your yard.</span></h1>
        <p className="hero-lede">Create work, find work, and trade in your community.</p>
        <p className="hero-body">WORKYARD connects people who need a job done with skilled people right in their own neighbourhood. Less travel. More opportunity. Stronger communities.</p>
        <div className="hero-buttons"><a className="btn" href="#workers">Find a worker <ArrowRight size={17}/></a><a className="btn btn-outline" href="#join">I'm a worker</a></div>
        <div className="hero-proof"><div className="avatar-stack"><span>A</span><span>C</span><span>M</span><span>+</span></div><p><strong>Local first.</strong> Trust built one job at a time.</p></div>
      </div>
      <div className="hero-art">
        <div className="art-circle"></div>
        <div className="art-card art-card-top"><span className="mini-icon"><CheckCircle2 size={17}/></span><div><strong>Verified locally</strong><small>Trust starts here</small></div></div>
        <div className="house-scene">
          <div className="sun"></div><div className="cloud cloud-one"></div><div className="cloud cloud-two"></div>
          <div className="roof"></div><div className="house"><div className="window"></div><div className="door"></div></div>
          <div className="yard-ground"></div><div className="person person-one"><i></i><b></b><em></em></div><div className="person person-two"><i></i><b></b><em></em></div>
          <div className="toolbox"><Wrench size={22}/></div>
        </div>
        <div className="art-card art-card-bottom"><div className="round-icon"><MapPin size={17}/></div><div><strong>Right in your LGA</strong><small>Work close to home</small></div></div>
        <div className="decor decor-star">✳</div><div className="decor decor-dot"></div>
      </div>
    </section>

    <section className="search-band">
      <div className="wrap search-inner"><div><strong>Find skilled people near you</strong><span>Search your community first.</span></div>
        <form action="#workers" className="search-form">
          <label><Search size={18}/><input name="skill" placeholder="What do you need done?"/></label>
          <label><MapPin size={18}/><select name="lga" defaultValue=""><option value="">Choose your LGA</option><option>Akoko South-West</option><option>Akoko North-East</option><option>Akoko North-West</option><option>Akoko South-East</option></select></label>
          <button className="btn" type="submit">Search workers</button>
        </form>
      </div>
    </section>

    <section className="section wrap" id="workers">
      <div className="section-heading"><div><div className="eyebrow">YOUR COMMUNITY, YOUR PEOPLE</div><h2>Skilled hands, <span>close by.</span></h2><p>Meet local workers ready to help. Verification status is shown clearly.</p></div><a className="text-link" href="#join">View all workers <ArrowRight size={16}/></a></div>
      <div className="skill-pills">{skills.map((s,i)=><a key={s} className={i===0?"active":""} href="#workers">{s}</a>)}</div>
      <div className="worker-grid">{workers.map(w=><article className="worker-card" key={w.name}>
        <div className={`worker-avatar ${w.tone}`}>{w.initials}</div><div className="worker-main"><div className="worker-title"><h3>{w.name}</h3>{w.verified?<span className="verified"><BadgeCheck size={14}/> Verified</span>:<span className="unverified">Unverified</span>}</div><p className="worker-skill">{w.skill}</p><p className="worker-area"><MapPin size={14}/>{w.area} · {w.lga}</p><div className="worker-bottom"><strong>{w.price}</strong><span>★ {w.rating}</span></div></div>
        <button className="contact-btn" aria-label={`Contact ${w.name}`}><ArrowRight size={17}/></button>
      </article>)}</div>
      <p className="demo-note">Sample profiles for preview. Live worker listings appear after Supabase setup and worker approval.</p>
    </section>

    <section className="purpose" id="how"><div className="wrap purpose-grid">
      <div><div className="eyebrow light">WHY WORKYARD EXISTS</div><h2>Good work should<br/>start <span>close to home.</span></h2><p>Unemployment and distrust keep too many people from opportunity. WORKYARD starts with the people and skills already around you—so clients find reliable help nearby and local workers spend less on transport to earn a living.</p><a className="btn btn-yellow" href="#join">Be part of the first yard <ArrowRight size={16}/></a></div>
      <div className="steps"><div className="step"><div className="step-num">01</div><div><h3>Find work in your yard</h3><p>Clients post a job for their LGA. Nearby workers see it, apply, and get hired without travelling across town.</p></div></div><div className="step"><div className="step-num">02</div><div><h3>Build trust, one job at a time</h3><p>Worker identity checks, clear verification badges, reports, and reviews help communities make safer choices.</p></div></div><div className="step"><div className="step-num">03 <small>COMING NEXT</small></div><div><h3>Trade in your community</h3><p>Once trust grows through work, the same yard can become a safer place to buy and sell local goods.</p></div></div></div>
    </div></section>

    <section className="vision wrap" id="vision"><div className="vision-icon"><BriefcaseBusiness size={25}/></div><div><div className="eyebrow">PHASE 1 → PHASE 2</div><h2>From finding work to finding<br/><span>everything in your yard.</span></h2><p>First, create local opportunity through jobs. Next, bring that trusted community into a neighbourhood marketplace.</p></div><div className="vision-stat"><Users size={22}/><strong>Community-powered</strong><span>Built around local trust</span></div></section>

    <section className="join-section" id="join"><div className="wrap join-inner"><div><div className="eyebrow light">YOUR YARD IS OUR STARTING POINT</div><h2>Ready to make work<br/>happen nearby?</h2><p>Join WORKYARD as a client or worker. Start with your community.</p></div><div className="join-actions"><a className="btn btn-yellow" href="/signup/" target="_blank" rel="noreferrer">Get started with WORKYARD <ArrowRight size={16}/></a><span>Phone OTP sign-in will be enabled after Supabase configuration.</span></div></div></section>

    <footer className="footer wrap"><a className="brand" href="#"><span className="brand-mark"><MapPin size={18}/><Wrench size={17}/></span><span>WORK<span>YARD</span></span></a><p>Local skills. Shared trust. More opportunity.</p><small>© 2025 WORKYARD. Made for the community.</small></footer>
  </main>;
}