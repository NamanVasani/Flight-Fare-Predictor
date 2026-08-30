import { FormEvent, useEffect, useMemo, useState } from "react";
import { FlightInput, FlightRow, Prediction, predictFlight } from "./predictionService";

type Phase = "intro" | "search" | "journey" | "results";
type Theme = "flyfinder" | "orbit" | "constellation" | "blueprint";
type City = { name: string; country: string; code: string; lat: number; lon: number };
type User = { name: string; email: string };

const CITIES: City[] = [
  { name: "Ahmedabad", country: "India", code: "AMD", lat: 23.03, lon: 72.59 },
  { name: "Delhi", country: "India", code: "DEL", lat: 28.61, lon: 77.21 },
  { name: "Mumbai", country: "India", code: "BOM", lat: 19.08, lon: 72.88 },
  { name: "Singapore", country: "Singapore", code: "SIN", lat: 1.35, lon: 103.82 },
  { name: "Bengaluru", country: "India", code: "BLR", lat: 12.97, lon: 77.59 },
  { name: "Kolkata", country: "India", code: "CCU", lat: 22.57, lon: 88.36 },
  { name: "Chennai", country: "India", code: "MAA", lat: 13.08, lon: 80.27 },
  { name: "Hyderabad", country: "India", code: "HYD", lat: 17.39, lon: 78.49 },
  { name: "Dubai", country: "UAE", code: "DXB", lat: 25.20, lon: 55.27 },
  { name: "London", country: "UK", code: "LHR", lat: 51.47, lon: -0.45 },
  { name: "Cochin", country: "India", code: "COK", lat: 9.93, lon: 76.26 },
];

const INITIAL: FlightInput = {
  from: "Ahmedabad",
  to: "Delhi",
  date: new Date().toISOString().split("T")[0],
};

function city(name: string): City {
  if (!name) return CITIES[0];
  const clean = name.split(" (")[0].trim();
  return (
    CITIES.find(
      (entry) =>
        entry.name.toLowerCase() === clean.toLowerCase() ||
        entry.code.toLowerCase() === clean.toLowerCase()
    ) || CITIES[0]
  );
}

// Precise Orthographic Globe projection formula centered on South Asia (78°E, 20°N)
function point(location: City) {
  const centerLon = 78.0;
  const centerLat = 20.0;
  const scale = 138.0;

  const dLon = ((location.lon - centerLon) * Math.PI) / 180;
  const latRad = (location.lat * Math.PI) / 180;
  const centerLatRad = (centerLat * Math.PI) / 180;

  const x = 300 + scale * Math.cos(latRad) * Math.sin(dLon);
  const y =
    200 -
    scale *
      (Math.cos(centerLatRad) * Math.sin(latRad) -
        Math.sin(centerLatRad) * Math.cos(latRad) * Math.cos(dLon));

  return { x, y };
}

function routePath(start: City, end: City) {
  const a = point(start);
  const b = point(end);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.max(45, dist * 0.4);
  const midX = (a.x + b.x) / 2;
  const midY = Math.min(a.y, b.y) - lift;

  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function Globe({
  from,
  to,
  opening = false,
  focus = "route",
}: {
  from?: City;
  to?: City;
  opening?: boolean;
  focus?: "departure" | "route" | "arrival";
}) {
  const path = from && to ? routePath(from, to) : "M 220 200 Q 300 110 360 220";
  const a = from && point(from);
  const b = to && point(to);

  const departureBox = a ? `${a.x - 100} ${a.y - 75} 200 150` : "0 0 600 400";
  const arrivalBox = b ? `${b.x - 100} ${b.y - 75} 200 150` : "0 0 600 400";
  const openingBox = "115 15 370 370";
  const viewBox = opening
    ? openingBox
    : focus === "departure"
    ? departureBox
    : focus === "arrival"
    ? arrivalBox
    : "0 0 600 400";
  const fromBox = opening ? openingBox : focus === "route" ? departureBox : "0 0 600 400";

  return (
    <svg
      key={focus}
      className={`globe-svg ${opening ? "opening-globe" : ""}`}
      viewBox={fromBox}
      role="img"
      aria-label={
        from && to
          ? `Flight map route from ${from.name}, ${from.country} to ${to.name}, ${to.country}`
          : "Animated Earth Globe"
      }
    >
      {!opening && (
        <animate
          attributeName="viewBox"
          from={fromBox}
          to={viewBox}
          dur="1.4s"
          fill="freeze"
          calcMode="spline"
          keySplines=".2 .8 .2 1"
        />
      )}
      <defs>
        <radialGradient id="earth" cx="35%" cy="30%">
          <stop stopColor="#185d87" />
          <stop offset=".55" stopColor="#0b3558" />
          <stop offset="1" stopColor="#051525" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="flightGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="sphere">
          <circle cx="300" cy="200" r="157" />
        </clipPath>
      </defs>
      <circle className="atmosphere" cx="300" cy="200" r="173" />
      <circle className="orbit orbit-a" cx="300" cy="200" r="188" />
      <ellipse className="orbit orbit-b" cx="300" cy="200" rx="235" ry="87" />
      <circle cx="300" cy="200" r="157" fill="url(#earth)" />
      <image
        href="/assets/earth-photoreal.png"
        x="143"
        y="43"
        width="314"
        height="314"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#sphere)"
      />
      <g clipPath="url(#sphere)" className="earth-detail">
        <path
          className="grid"
          d="M145 150h310M142 200h316M150 250h300M300 43v314M235 56c32 90 32 200 0 288M365 56c-32 90-32 200 0 288"
        />
      </g>

      {/* Flight Path Arc Lines */}
      <path className="route-shadow" d={path} />
      <path className="route-glow-trail" d={path} filter="url(#flightGlow)" />
      <path className="route" d={path} />

      {/* Origin City Pill Badge - Offset Top-Left */}
      {a && from && (
        <g className="marker from">
          <circle className="radar-ring" cx={a.x} cy={a.y} r="12" />
          <circle cx={a.x} cy={a.y} r="5" fill="#5af2dd" />
          <g transform={`translate(${a.x - 90}, ${a.y - 32})`}>
            <rect
              width="95"
              height="22"
              rx="6"
              fill="rgba(6, 17, 26, 0.92)"
              stroke="#5af2dd"
              strokeWidth="1.2"
            />
            <text
              x="47.5"
              y="14"
              textAnchor="middle"
              fill="#5af2dd"
              fontSize="10"
              fontWeight="700"
              fontFamily="DM Mono"
            >
              {from.code} • {from.name}
            </text>
          </g>
        </g>
      )}

      {/* Destination City Pill Badge - Offset Bottom-Right */}
      {b && to && (
        <g className="marker to">
          <circle className="radar-ring" cx={b.x} cy={b.y} r="12" />
          <circle cx={b.x} cy={b.y} r="5" fill="#ffffff" />
          <g transform={`translate(${b.x + 10}, ${b.y + 10})`}>
            <rect
              width="95"
              height="22"
              rx="6"
              fill="rgba(6, 17, 26, 0.92)"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <text
              x="47.5"
              y="14"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="700"
              fontFamily="DM Mono"
            >
              {to.code} • {to.name}
            </text>
          </g>
        </g>
      )}

      {/* Dynamic Airplane Sprite orienting along arc vector */}
      <g className="aircraft" filter="url(#glow)">
        <path
          d="M 12 0 L -6 -9 L -2 -2 L -12 -5 L -10 0 L -12 5 L -2 2 L -6 9 Z"
          fill="#5af2dd"
        />
        <animateMotion
          dur={opening ? "7.5s" : "4.8s"}
          repeatCount={opening ? "indefinite" : "1"}
          rotate="auto"
          path={path}
        />
      </g>
    </svg>
  );
}

function ThemeSelector({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="theme-selector-bar">
      <span className="selector-title">THEME:</span>
      <button
        className={`theme-chip ${theme === "flyfinder" ? "active" : ""}`}
        onClick={() => setTheme("flyfinder")}
      >
        ✈️ FlyFinder Cabernet
      </button>
      <button
        className={`theme-chip ${theme === "orbit" ? "active" : ""}`}
        onClick={() => setTheme("orbit")}
      >
        🌐 World Spinner
      </button>
      <button
        className={`theme-chip ${theme === "constellation" ? "active" : ""}`}
        onClick={() => setTheme("constellation")}
      >
        🌌 Constellation
      </button>
      <button
        className={`theme-chip ${theme === "blueprint" ? "active" : ""}`}
        onClick={() => setTheme("blueprint")}
      >
        📐 Blueprint
      </button>
    </div>
  );
}

function Intro({
  enter,
  openAuth,
}: {
  enter: () => void;
  openAuth: (mode: "login" | "signup") => void;
}) {
  return (
    <main className="intro">
      <div className="intro-top">
        <div className="top-auth-buttons">
          <button className="login-button quiet" onClick={() => openAuth("login")}>
            Log in
          </button>
          <button className="login-button primary cabernet-btn" onClick={() => openAuth("signup")}>
            Sign up
          </button>
        </div>
      </div>

      <div className="hero-grid">
        <section className="intro-copy">
          <p className="eyebrow">FLIGHT INTELLIGENCE NETWORK</p>
          <h1>
            Every journey <i>starts in orbit.</i>
          </h1>
          <p className="lede">
            A quieter, clearer way to analyze and predict airfare dynamics
            <br />
            across global routes with live machine learning intelligence.
          </p>
          <div className="hero-action-row">
            <button className="primary-hero-btn" onClick={enter}>
              Enter flight intelligence <b>→</b>
            </button>
            <button className="secondary-hero-btn" onClick={() => openAuth("signup")}>
              Join FlyFinder Free ✦
            </button>
          </div>
        </section>

        <div className="intro-globe-wrapper">
          <Globe opening />
        </div>
      </div>

      <div className="telemetry">
        <span>ORBITAL PATH / LOCKED</span>
        <span>ALTITUDE / 38,000 FT</span>
        <span>AI NAV / ACTIVE</span>
      </div>
    </main>
  );
}

function Search({
  input,
  setInput,
  submit,
  error,
  user,
  openAuth,
  logout,
}: {
  input: FlightInput;
  setInput: (value: FlightInput) => void;
  submit: (event: FormEvent) => void;
  error: string;
  user: User | null;
  openAuth: (mode: "login" | "signup") => void;
  logout: () => void;
  theme?: Theme;
  setTheme?: (t: Theme) => void;
}) {
  const change = (key: keyof FlightInput, value: string) =>
    setInput({ ...input, [key]: value });

  const swap = () => {
    setInput({ ...input, from: input.to, to: input.from });
  };

  return (
    <main className="app-shell theme-flyfinder">
      <header className="flyfinder-header">
        <div className="logo-group">
          <span className="flyfinder-logo-icon">✈</span>
          <a className="flyfinder-brand" href="#top">
            FlyFinder
          </a>
        </div>
        <div className="right-header-group">
          <a href="#about" className="head-link">About Us</a>
          <a href="#support" className="head-link">Support</a>
          {user ? (
            <button className="user-pill" onClick={logout}>
              {user.name} (Logout)
            </button>
          ) : (
            <div className="auth-header-buttons">
              <button className="login-button quiet" onClick={() => openAuth("login")}>
                Login
              </button>
              <button className="login-button primary" onClick={() => openAuth("signup")}>
                Create Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search Hero Page - Photo Reference Match */}
      <section className="search-hero-integrated">
        <div className="search-hero-content">
          <p className="eyebrow-cabernet">ROUTE FORECASTING / LIVE</p>
          <h1 className="hero-title-main">
            Where will <br />
            <i className="serif-highlight">you go next?</i>
          </h1>
          <p className="hero-subtext">
            Select origin and destination to generate live flight schedules & fare forecasts with AI precision.
          </p>

          {/* Floating Search Bar Card */}
          <form className="flyfinder-search-bar" onSubmit={submit}>
            <div className="search-field-box">
              <div className="field-inputs">
                <small>FROM <span className="sub-label">( SOURCE )</span></small>
                <select
                  value={input.from}
                  onChange={(e) => change("from", e.target.value)}
                >
                  {CITIES.map((item) => (
                    <option key={item.code} value={item.name}>{item.name} ({item.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" className="swap-btn" onClick={swap} title="Swap cities">
              ⇄
            </button>

            <div className="search-field-box">
              <div className="field-inputs">
                <small>TO <span className="sub-label">( DESTINATION )</span></small>
                <select
                  value={input.to}
                  onChange={(e) => change("to", e.target.value)}
                >
                  {CITIES.map((item) => (
                    <option key={item.code} value={item.name}>{item.name} ({item.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" className="route-select-icon-btn" title="Route options">
              🔀
            </button>

            <div className="search-field-box date-box">
              <div className="field-inputs">
                <small>DATE</small>
                <input
                  required
                  type="date"
                  value={input.date}
                  onChange={(e) => change("date", e.target.value)}
                />
              </div>
            </div>

            <button className="flyfinder-search-btn" type="submit">
              🔍 Search
            </button>
          </form>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="hero-globe-side">
          <Globe opening from={city(input.from)} to={city(input.to)} />
        </div>
      </section>

      <InfoSections />
    </main>
  );
}

function LoginDialog({
  initialTab = "login",
  close,
  onLogin,
}: {
  initialTab?: "login" | "signup";
  close: () => void;
  onLogin: (user: User) => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const userName = name || email.split("@")[0];
    onLogin({ name: userName, email });
    close();
  };

  return (
    <div
      className="login-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or Create Account"
    >
      <div className="login-card cabernet-modal">
        <button
          className="close-login"
          type="button"
          onClick={close}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="modal-globe-header">
          <div className="mini-globe-badge">
            <Globe opening />
          </div>
          <p className="eyebrow">FLYFINDER NETWORK</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
          >
            Create Account
          </button>
        </div>

        <h2>
          {tab === "login" ? "Welcome back to" : "Start your"}
          <br />
          <i>FlyFinder.</i>
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === "signup" && (
            <label>
              FULL NAME
              <input
                required
                type="text"
                placeholder="Naman Vasani"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label>
            EMAIL ADDRESS
            <input
              required
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="password-label">
            PASSWORD
            <div className="password-wrapper">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁" : "🔒"}
              </button>
            </div>
          </label>

          <button className="primary-button full-width cabernet-btn" type="submit">
            {tab === "login" ? "Sign in securely →" : "Create Account →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Journey({
  input,
  step,
  onSkip,
}: {
  input: FlightInput;
  step: "departure" | "route" | "arrival";
  onSkip: () => void;
}) {
  const from = city(input.from);
  const to = city(input.to);

  const [alt, setAlt] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    let interval: number;
    if (step === "departure") {
      setAlt(0);
      setSpeed(0);
      setDist(0);
      let a = 0, s = 0, d = 0;
      interval = window.setInterval(() => {
        if (a < 18400) a += 1200;
        if (s < 680) s += 45;
        if (d < 320) d += 20;
        setAlt(a);
        setSpeed(s);
        setDist(d);
      }, 100);
    } else if (step === "route") {
      let a = 18400, s = 680, d = 320;
      interval = window.setInterval(() => {
        if (a < 38000) a += 900;
        if (s < 870) s += 20;
        if (d < 1850) d += 80;
        setAlt(a);
        setSpeed(s);
        setDist(d);
      }, 100);
    } else {
      let a = 38000, s = 870, d = 1850;
      interval = window.setInterval(() => {
        if (a > 4200) a -= 1500;
        if (s > 390) s -= 30;
        if (d < 3120) d += 70;
        setAlt(Math.max(4200, a));
        setSpeed(Math.max(390, s));
        setDist(Math.min(3120, d));
      }, 100);
    }
    return () => window.clearInterval(interval);
  }, [step]);

  return (
    <main className="journey">
      <header>
        <span className="brand">FLYFINDER</span>
        <div className="journey-top-status">
          <span className="live-dot">LIVE 3D FLIGHT ANIMATION</span>
          <button className="skip-btn" onClick={onSkip}>
            Skip to results <b>→</b>
          </button>
        </div>
      </header>

      <div className="journey-hud">
        <div className="hud-card">
          <small>ROUTE</small>
          <strong>{from.code} ✈ {to.code}</strong>
        </div>
        <div className="hud-card">
          <small>STATUS</small>
          <strong>SEARCHING FARES</strong>
        </div>
        <div className="hud-card">
          <small>ALTITUDE</small>
          <strong>{alt.toLocaleString()} FT</strong>
        </div>
        <div className="hud-card">
          <small>GROUND SPEED</small>
          <strong>{speed} KM/H</strong>
        </div>
      </div>

      <div className="journey-copy">
        <p className="eyebrow">
          {step === "departure"
            ? "DEPARTURE RADAR / TAKEOFF"
            : step === "arrival"
            ? "DESTINATION RADAR / TOUCHDOWN"
            : "FLIGHT PATH / IN TRANSIT"}
        </p>
        <h1>
          {from.code} <span>✈</span> {to.code}
        </h1>
      </div>

      <Globe from={from} to={to} focus={step} />

      <div className="journey-status">
        <div className={`status-node ${step === "departure" ? "active" : ""}`}>
          <span className="node-num">01</span>
          <div>
            <strong>DEPARTURE</strong>
            <small>{from.name}, {from.country}</small>
          </div>
        </div>
        <div className={`status-node ${step === "route" ? "active" : ""}`}>
          <span className="node-num">02</span>
          <div>
            <strong>IN FLIGHT</strong>
            <small>{dist.toLocaleString()} KM COVERED</small>
          </div>
        </div>
        <div className={`status-node ${step === "arrival" ? "active" : ""}`}>
          <span className="node-num">03</span>
          <div>
            <strong>ARRIVAL</strong>
            <small>{to.name}, {to.country}</small>
          </div>
        </div>
      </div>
    </main>
  );
}

function Results({
  input,
  setInput,
  prediction,
  message,
  restart,
  submitSearch,
  theme,
  setTheme,
}: {
  input: FlightInput;
  setInput: (value: FlightInput) => void;
  prediction?: Prediction;
  message: string;
  restart: () => void;
  submitSearch: (e: FormEvent) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  const swap = () => {
    setInput({ ...input, from: input.to, to: input.from });
  };

  return (
    <main className={`flyfinder-results-page theme-${theme}`}>
      {/* Top Header */}
      <header className="flyfinder-header">
        <div className="logo-group">
          <span className="flyfinder-logo-icon">✈</span>
          <span className="flyfinder-brand">FlyFinder</span>
        </div>
        <ThemeSelector theme={theme} setTheme={setTheme} />
        <div className="right-header-group">
          <a href="#about" className="head-link">About Us</a>
          <a href="#support" className="head-link">Support</a>
          <button className="quiet-button" onClick={restart}>≡</button>
        </div>
      </header>

      {/* Floating Top Search Bar */}
      <section className="flyfinder-search-wrapper">
        <form className="flyfinder-search-bar" onSubmit={submitSearch}>
          <div className="search-field-box">
            <span className="field-icon">✈</span>
            <div className="field-inputs">
              <small>From (Source)</small>
              <select
                value={input.from}
                onChange={(e) => setInput({ ...input, from: e.target.value })}
              >
                {CITIES.map((item) => (
                  <option key={item.code}>{item.name} ({item.code})</option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" className="swap-btn" onClick={swap} title="Swap cities">
            ⇆
          </button>

          <div className="search-field-box">
            <span className="field-icon">📍</span>
            <div className="field-inputs">
              <small>To (Destination)</small>
              <select
                value={input.to}
                onChange={(e) => setInput({ ...input, to: e.target.value })}
              >
                {CITIES.map((item) => (
                  <option key={item.code}>{item.name} ({item.code})</option>
                ))}
              </select>
            </div>
          </div>

          <button className="flyfinder-search-btn" type="submit">
            🔍 Search
          </button>
        </form>
      </section>

      {/* Grouped Price Tier Sections */}
      {prediction ? (
        <div className="price-groups-container">
          {prediction.groups.map((group) => (
            <div key={group.type} className={`price-group-card group-${group.type}`}>
              {/* Group Header Banner */}
              <div className="group-header-banner">
                <div className="group-title-left">
                  <span className="group-icon">{group.icon}</span>
                  <div>
                    <h2>{group.title}</h2>
                    <p>{group.subtitle}</p>
                  </div>
                </div>
                <span className="flight-count-pill">
                  {group.flights.length} Flights
                </span>
              </div>

              {/* Flights Table / List inside Group */}
              <div className="group-flights-list">
                {group.flights.map((flight) => (
                  <div key={flight.id} className="flight-row-card">
                    {/* Airline Badge */}
                    <div className="airline-badge-col">
                      <span
                        className="airline-logo-box"
                        style={{ backgroundColor: flight.logoBg, color: flight.logoColor }}
                      >
                        {flight.code}
                      </span>
                      <strong className="airline-name-text">{flight.airline}</strong>
                    </div>

                    {/* Schedule & Duration Line */}
                    <div className="flight-schedule-col">
                      <div className="time-point">
                        <strong>{flight.departureTime}</strong>
                        <small>{flight.departureCode}</small>
                      </div>

                      <div className="route-timeline-box">
                        <small>{flight.duration}</small>
                        <div className="timeline-graphic">
                          <span className="timeline-dot" />
                          <span className="timeline-line" />
                          <span className="timeline-dot" />
                        </div>
                        <small className="stops-label">{flight.stops}</small>
                      </div>

                      <div className="time-point right">
                        <strong>{flight.arrivalTime}</strong>
                        <small>{flight.arrivalCode}</small>
                      </div>
                    </div>

                    {/* Cabin Class */}
                    <div className="cabin-badge-col">
                      <span>🔒 {flight.cabin}</span>
                    </div>

                    {/* Bold Price Button */}
                    <div className="price-action-col">
                      <button className={`flyfinder-price-btn price-${group.type}`}>
                        ₹ {flight.fare.toLocaleString("en-IN")} <b>›</b>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <p>{message}</p>
        </div>
      )}

      {/* FlyFinder Footer */}
      <footer className="flyfinder-footer">
        <span>🛡️ Safe Booking</span>
        <span className="footer-dot">•</span>
        <span>⭐ Best Prices</span>
        <span className="footer-dot">•</span>
        <span>🎧 24/7 Support</span>
      </footer>
    </main>
  );
}

function InfoSections() {
  return (
    <>
      <section className="info-section" id="process">
        <p className="eyebrow-works">HOW FLYFINDER WORKS</p>
        <div className="process-grid">
          <div className="process-step-card">
            <span className="step-icon">✈</span>
            <div className="step-content">
              <strong>Flight details</strong>
              <p>Real-time schedules & aircraft insights</p>
            </div>
          </div>
          <span className="process-arrow">→</span>
          <div className="process-step-card">
            <span className="step-icon">📊</span>
            <div className="step-content">
              <strong>Feature signals</strong>
              <p>Weather, traffic & route patterns</p>
            </div>
          </div>
          <span className="process-arrow">→</span>
          <div className="process-step-card">
            <span className="step-icon">🧠</span>
            <div className="step-content">
              <strong>Model analysis</strong>
              <p>AI/ML models predict outcomes</p>
            </div>
          </div>
          <span className="process-arrow">→</span>
          <div className="process-step-card">
            <span className="step-icon">💲</span>
            <div className="step-content">
              <strong>Fare intelligence</strong>
              <p>Smart fare forecast & recommendations</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="flyfinder-footer">
        <span className="footer-brand">FLYFINDER</span>
        <p>© 2025 FlyFinder Flight Intelligence Network</p>
      </footer>
    </>
  );
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [theme, setTheme] = useState<Theme>("orbit");
  const [input, setInput] = useState<FlightInput>(INITIAL);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<Prediction>();
  const [message, setMessage] = useState("Prediction service ready.");
  const [journeyStep, setJourneyStep] = useState<
    "departure" | "route" | "arrival"
  >("departure");
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);

  // Landing page remains until user interacts
  useEffect(() => {}, [phase]);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setLoginOpen(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (city(input.from).name === city(input.to).name) {
      return setError("Please select two different airports.");
    }
    setError("");
    setJourneyStep("departure");
    setPhase("journey");

    const t1 = window.setTimeout(() => setJourneyStep("route"), 1600);
    const t2 = window.setTimeout(() => setJourneyStep("arrival"), 3800);
    const t3 = window.setTimeout(async () => {
      try {
        const result = await predictFlight(input);
        setPrediction(result);
        setMessage("");
      } catch (err) {
        setPrediction(undefined);
        setMessage(
          err instanceof Error ? err.message : "Prediction is unavailable."
        );
      } finally {
        setPhase("results");
      }
    }, 5600);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  };

  const skipJourney = async () => {
    try {
      const result = await predictFlight(input);
      setPrediction(result);
      setMessage("");
    } catch (err) {
      setPrediction(undefined);
      setMessage(
        err instanceof Error ? err.message : "Prediction is unavailable."
      );
    } finally {
      setPhase("results");
    }
  };

  const content = useMemo(() => {
    if (phase === "intro") {
      return <Intro enter={() => setPhase("search")} openAuth={openAuth} />;
    }
    if (phase === "search") {
      return (
        <Search
          input={input}
          setInput={setInput}
          submit={submit}
          error={error}
          user={user}
          openAuth={openAuth}
          logout={() => setUser(null)}
          theme={theme}
          setTheme={setTheme}
        />
      );
    }
    if (phase === "journey") {
      return (
        <Journey input={input} step={journeyStep} onSkip={skipJourney} />
      );
    }
    return (
      <Results
        input={input}
        setInput={setInput}
        prediction={prediction}
        message={message}
        restart={() => setPhase("search")}
        submitSearch={submit}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }, [phase, input, error, prediction, message, journeyStep, user, theme]);

  return (
    <>
      {content}
      {loginOpen && (
        <LoginDialog
          initialTab={authMode}
          close={() => setLoginOpen(false)}
          onLogin={(u) => setUser(u)}
        />
      )}
    </>
  );
}
