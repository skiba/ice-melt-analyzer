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

  // Calculate TDD and cumulative melt
  const analysis = weatherData.map((d, i) => {
    const avg = (d.max + d.min) / 2;
    const tdd = Math.max(0, avg);
    // Bonus for rain (warm rain accelerates melt) and sun
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
          <input
            type="range" min={10} max={40} value={iceThickness}
            onChange={(e) => setIceThickness(Number(e.target.value))}
            style={{ width: 200 }}
          />
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
          <p style={{ fontSize: "11px", color: "#64748b", marginTop: 4 }}>{MELT_FACTORS[scenario].desc}</p>
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
                  <td style={{ padding: "8px 6px", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {d.dow} {d.date}
                  </td>
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
                        <div style={{
                          width: `${Math.max(0, pct * 100)}%`, height: "100%", background: barColor,
                          borderRadius: 7, transition: "width 0.3s"
                        }} />
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

      {/* How it works */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8", marginBottom: 12 }}>📐 Jak to się liczy?</h2>
        <div style={{ fontSize: "13px", lineHeight: 1.8, color: "#cbd5e1" }}>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "#f59e0b" }}>1. Średnia dobowa temperatura</strong> = (max + min) / 2.
            Np. jeśli dzień ma max +11° i min +1°, to średnia = +6°C.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "#f59e0b" }}>2. TDD (Thawing Degree Days)</strong> = stopniodni odwilży.
            Bierzemy tylko dodatnią część średniej temperatury. Jeśli średnia to +6°C, to TDD = 6.
            Jeśli średnia to -4.5°C, to TDD = 0 (lód nie topnieje).
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "#f59e0b" }}>3. Współczynnik topnienia</strong> – ile cm lodu topnieje na 1 stopniodzień.
            Zależy od: słońca, deszczu, wiatru, ekspozycji jeziora.
            Zakres to zazwyczaj 0.5–1.0 cm/TDD. Deszcz i słońce przyspieszają proces.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "#f59e0b" }}>4. Dzienny ubytek</strong> = TDD × współczynnik + bonusy (deszcz, dużo słońca).
            Np. dzień ze średnią +8°C i deszczem: 8 × 0.75 + bonus = ~7 cm/dzień.
          </p>
          <p>
            <strong style={{ color: "#f59e0b" }}>5. Sumujemy</strong> dzień po dniu i odejmujemy od startowej grubości lodu.
          </p>
        </div>
      </div>

      {/* Ice formation education */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8", marginBottom: 16 }}>🧊 Jak powstaje lód na jeziorze?</h2>

        {/* Animated diagram */}
        <div style={{ position: "relative", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 50%, #1a5276 70%, #1a6e5c 100%)", borderRadius: 12, padding: 20, marginBottom: 20, minHeight: 320, overflow: "hidden" }}>
          {/* Air label */}
          <div style={{ position: "absolute", top: 12, left: 16, color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}>
            ❄️ MROŹNE POWIETRZE (-10 do -20°C)
          </div>
          {/* Arrows showing cold penetration */}
          <div style={{ position: "absolute", top: 35, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 30 }}>
            {["↓", "↓", "↓", "↓", "↓"].map((a, i) => (
              <span key={i} style={{ color: "#60a5fa", fontSize: "18px", opacity: 0.6 }}>{a}</span>
            ))}
          </div>

          {/* Surface line */}
          <div style={{ position: "absolute", top: 55, left: 0, right: 0, borderTop: "2px dashed #64748b" }}>
            <span style={{ position: "absolute", right: 10, top: -18, color: "#64748b", fontSize: "10px" }}>~10% nad wodą</span>
          </div>

          {/* Ice layer */}
          <div style={{
            position: "absolute", top: 60, left: 20, right: 20, height: 80,
            background: "linear-gradient(180deg, #a8d8ea 0%, #88c4e0 30%, #6bb5d8 60%, #4da6cf 100%)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 20px rgba(56,189,248,0.2)"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#0f172a", fontWeight: 700, fontSize: "14px" }}>WARSTWA LODU</div>
              <div style={{ color: "#1e3a5f", fontSize: "11px" }}>izoluje wodę od mrozu</div>
              <div style={{ color: "#1e3a5f", fontSize: "11px", fontWeight: 600 }}>~90% zanurzone w wodzie</div>
            </div>
          </div>

          {/* Growth arrow */}
          <div style={{
            position: "absolute", top: 145, left: "50%", transform: "translateX(-50%)",
            background: "#f59e0b", color: "#0f172a", padding: "4px 12px", borderRadius: 20,
            fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap"
          }}>
            ▼ LÓD ROŚNIE W DÓŁ ▼
          </div>

          {/* Water layer */}
          <div style={{
            position: "absolute", top: 170, left: 20, right: 20, height: 80,
            background: "linear-gradient(180deg, rgba(26,110,92,0.6) 0%, rgba(26,82,118,0.8) 100%)",
            borderRadius: "0 0 8px 8px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#5eead4", fontWeight: 700, fontSize: "14px" }}>WODA ~0°C do +4°C</div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>zawsze płynna pod lodem</div>
            </div>
          </div>

          {/* Bottom - warm water */}
          <div style={{ position: "absolute", bottom: 12, left: 16, color: "#5eead4", fontSize: "11px" }}>
            🌡️ Dno jeziora: najciężejsza woda +4°C
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            {
              icon: "🍂", title: "Jesień — ochładzanie",
              color: "#f59e0b",
              text: "Woda w jeziorze stopniowo traci ciepło. Kluczowa właściwość: woda jest najcięższa w +4°C. Gdy powierzchnia schodzi poniżej 4°C, zimniejsza woda jest lżejsza i zostaje na górze."
            },
            {
              icon: "🥶", title: "Pierwsze mrozy — 0°C na powierzchni",
              color: "#38bdf8",
              text: "Powierzchnia osiąga 0°C i zamarza. Tworzy się pierwsza cienka warstwa lodu. Od tego momentu lód działa jak kołdra — izoluje wodę od mroźnego powietrza."
            },
            {
              icon: "⬇️", title: "Lód rośnie DO DOŁU",
              color: "#a78bfa",
              text: "Mróz przenika przez istniejący lód i zamraża kolejną warstwę wody na SPODZIE. Lód przyrasta warstwa po warstwie, ale zawsze od dołu. Pod lodem jest zawsze płynna woda blisko 0°C."
            },
            {
              icon: "🧊", title: "Lód pływa — 90% pod wodą",
              color: "#22d3ee",
              text: "Lód jest lżejszy od wody (~917 kg/m³ vs 1000 kg/m³), dlatego pływa. Ok. 90% jest zanurzone, ~10% wystaje. Przy 25 cm lodu to zaledwie 2-3 cm ponad lustro wody."
            },
            {
              icon: "📉", title: "Krzywa logarytmiczna — coraz wolniej",
              color: "#f472b6",
              text: "Im grubszy lód, tym lepiej izoluje wodę od mrozu. Przy 10 cm lód rośnie szybko. Przy 30 cm nawet mróz -20°C dodaje milimetry dziennie. Dlatego w Polsce lód rzadko przekracza 30-40 cm."
            },
            {
              icon: "📊", title: "Twoje 20-30 cm = już maksimum",
              color: "#34d399",
              text: "Przy tej grubości lód osiągnął swój limit prawdopodobnie kilka tygodni temu. Od tamtej pory mróz już niewiele dodawał. Teraz czeka go droga w jedną stronę — topnienie."
            },
          ].map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "12px 14px",
              background: "rgba(15,23,42,0.5)", borderRadius: 10,
              borderLeft: `3px solid ${step.color}`
            }}>
              <div style={{ fontSize: "22px", flexShrink: 0 }}>{step.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: step.color, marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.6 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>⚠️ Ważne dla wędkarza!</h2>
        <div style={{ fontSize: "13px", lineHeight: 1.8, color: "#cbd5e1" }}>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "#ef4444" }}>Lód "szmatkowy" (kandelabrowy)</strong> – po kilku dniach odwilży lód nie topnieje
            równomiernie. Słońce przenika przez lód i topi go OD ŚRODKA, tworząc pionowe kryształy (kandele).
            Taki lód o grubości 20 cm może być słabszy niż solidny lód o grubości 5 cm!
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "#ef4444" }}>Deszcz 21-23.02</strong> – ciepły deszcz padający na lód jest
            jednym z najszybszych czynników topnienia. Te 3 dni deszczu mogą dramatycznie osłabić strukturę lodu.
          </p>
          <p>
            <strong style={{ color: "#ef4444" }}>Wniosek:</strong> Przy prognozowanych temperaturach +8 do +14°C
            od 22 lutego, lód jeziorny stanie się niebezpieczny znacznie szybciej niż wskazuje samo przeliczenie
            grubości. Szacunkowo od ~24-25 lutego wchodzenie na lód będzie bardzo ryzykowne niezależnie od
            początkowej grubości.
          </p>
        </div>
      </div>
    </div>
  );
}
