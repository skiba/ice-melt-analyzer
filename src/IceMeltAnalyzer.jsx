import { useState } from "react";

const weatherData = [
  { date: "20.02", dow: "Pt", max: 0, min: -9, cond: "☀️", rain: false, sunHrs: 8 },
  { date: "21.02", dow: "So", max: 5, min: -5, cond: "🌧️", rain: true, sunHrs: 0 },
  { date: "22.02", dow: "Nd", max: 8, min: 3, cond: "🌧️", rain: true, sunHrs: 0 },
  { date: "23.02", dow: "Pn", max: 9, min: 7, cond: "🌧️", rain: true, sunHrs: 0 },
  { date: "24.02", dow: "Wt", max: 8, min: 2, cond: "⛅", rain: false, sunHrs: 4 },
  { date: "25.02", dow: "Śr", max: 11, min: 1, cond: "☀️", rain: false, sunHrs: 7 },
  { date: "26.02", dow: "Cz", max: 14, min: 2, cond: "⛅", rain: false, sunHrs: 5 },
  { date: "27.02", dow: "Pt", max: 14, min: 7, cond: "🌧️", rain: true, sunHrs: 1 },
  { date: "28.02", dow: "So", max: 11, min: 4, cond: "☁️", rain: false, sunHrs: 3 },
  { date: "01.03", dow: "Nd", max: 11, min: 4, cond: "☀️", rain: false, sunHrs: 5 },
  { date: "02.03", dow: "Pn", max: 10, min: 2, cond: "☀️", rain: false, sunHrs: 4 },
  { date: "03.03", dow: "Wt", max: 13, min: 4, cond: "☀️", rain: false, sunHrs: 5 },
  { date: "04.03", dow: "Śr", max: 11, min: 2, cond: "☀️", rain: false, sunHrs: 6 },
  { date: "05.03", dow: "Cz", max: 12, min: 3, cond: "☀️", rain: false, sunHrs: 5 },
];

const MELT_FACTORS = {
  low: { factor: 0.5, label: "Ostrożny (0.5 cm/TDD)", desc: "osłonięte jezioro, mało wiatru" },
  mid: { factor: 0.75, label: "Typowy (0.75 cm/TDD)", desc: "przeciętne warunki" },
  high: { factor: 1.0, label: "Szybki (1.0 cm/TDD)", desc: "dużo słońca, deszcz, wiatr" },
};

export default function IceMeltAnalyzer() {
  const [iceThickness, setIceThickness] = useState(25);
  const [scenario, setScenario] = useState("mid");

  const mf = MELT_FACTORS[scenario].factor;

  const analysis = weatherData.map((d) => {
    const avg = (d.max + d.min) / 2;
    const tdd = Math.max(0, avg);
    const rainBonus = d.rain && avg > 2 ? 0.15 : 0;
    const sunBonus = d.sunHrs > 4 ? 0.1 : 0;
    const effectiveMelt = tdd * (mf + rainBonus + sunBonus);
    return { ...d, avg: avg.toFixed(1), tdd: tdd.toFixed(1), dailyMelt: effectiveMelt };
  });

  let cumMelt = 0;
  const withCumulative = analysis.map((d) => {
    cumMelt += d.dailyMelt;
    const remaining = Math.max(0, iceThickness - cumMelt);
    return { ...d, cumMelt: cumMelt.toFixed(1), remaining: remaining.toFixed(1) };
  });

  const iceGoneDay = withCumulative.find((d) => parseFloat(d.remaining) <= 0);
  const unsafeDay = withCumulative.find((d) => parseFloat(d.remaining) < iceThickness * 0.5);
  const maxBar = iceThickness;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#e2e8f0", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>
        🧊 Analiza topnienia lodu jeziornego
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: 20 }}>Poznań i okolice, luty–marzec 2026</p>

      {/* Controls */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24, padding: "16px", background: "#1e293b", borderRadius: 12 }}>
        <div>
          <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: 6 }}>Grubość lodu (cm)</label>
          <input type="range" min={10} max={40} value={iceThickness} onChange={(e) => setIceThickness(Number(e.target.value))} style={{ width: 200 }} />
          <span style={{ marginLeft: 10, fontWeight: 700, fontSize: "18px", color: "#38bdf8" }}>{iceThickness} cm</span>
        </div>
        <div>
          <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: 6 }}>Scenariusz topnienia</label>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(MELT_FACTORS).map(([key, val]) => (
              <button key={key} onClick={() => setScenario(key)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "12px",
                  background: scenario === key ? "#38bdf8" : "#334155",
                  color: scenario === key ? "#0f172a" : "#94a3b8",
                  fontWeight: scenario === key ? 700 : 400,
                }}>
                {val.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key results */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 200, background: "#1e293b", borderRadius: 12, padding: 16, borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>⚠️ Lód niebezpieczny (poniżej 50%)</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#f59e0b" }}>
            {unsafeDay ? `~${unsafeDay.date}` : "po 5 marca"}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: "#1e293b", borderRadius: 12, padding: 16, borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>🚫 Całkowite stopienie</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444" }}>
            {iceGoneDay ? `~${iceGoneDay.date}` : "po 5 marca"}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: "#1e293b", borderRadius: 12, padding: 16, borderLeft: "4px solid #22c55e" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>📊 Suma TDD (do 5.03)</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#22c55e" }}>
            {withCumulative[withCumulative.length - 1].cumMelt} cm stopione
          </div>
        </div>
      </div>

      {/* Day-by-day table */}
      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#1e293b" }}>
              {["Data", "Pogoda", "Max", "Min", "Śr.", "TDD", "Topn./dzień", "Skumulowane", "Pozostało"].map((h) => (
                <th key={h} style={{ padding: "8px 6px", textAlign: "center", color: "#94a3b8", fontSize: "11px", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withCumulative.map((d, i) => {
              const remaining = parseFloat(d.remaining);
              const pct = remaining / maxBar;
              const barColor = pct > 0.6 ? "#38bdf8" : pct > 0.3 ? "#f59e0b" : "#ef4444";
              const isGone = remaining <= 0;
              return (
                <tr key={i} style={{ background: isGone ? "#1a0505" : i % 2 === 0 ? "#0f172a" : "#1e293b" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, whiteSpace: "nowrap" }}>{d.dow} {d.date}</td>
                  <td style={{ textAlign: "center", fontSize: "16px" }}>{d.cond}</td>
                  <td style={{ textAlign: "center", color: d.max > 0 ? "#f59e0b" : "#38bdf8" }}>{d.max > 0 ? "+" : ""}{d.max}°</td>
                  <td style={{ textAlign: "center", color: d.min > 0 ? "#f59e0b" : "#38bdf8" }}>{d.min > 0 ? "+" : ""}{d.min}°</td>
                  <td style={{ textAlign: "center", color: parseFloat(d.avg) > 0 ? "#f59e0b" : "#38bdf8" }}>{d.avg}°</td>
                  <td style={{ textAlign: "center", color: "#22c55e", fontWeight: parseFloat(d.tdd) > 5 ? 700 : 400 }}>{d.tdd}</td>
                  <td style={{ textAlign: "center" }}>{d.dailyMelt.toFixed(1)} cm</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{d.cumMelt} cm</td>
                  <td style={{ padding: "8px 6px", width: 140 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 14, background: "#334155", borderRadius: 7, overflow: "hidden" }}>
                        <div style={{ width: `${Math.max(0, pct * 100)}%`, height: "100%", background: barColor, borderRadius: 7 }} />
                      </div>
                      <span style={{ fontSize: "11px", minWidth: 36, textAlign: "right", color: barColor, fontWeight: 700 }}>
                        {isGone ? "0" : d.remaining}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
