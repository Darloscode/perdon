import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = [
  "#ff6b9d",
  "#ffc3e0",
  "#ffec99",
  "#a8edea",
  "#c3b1e1",
  "#ffd6a5",
  "#b5ead7",
  "#ff9ecd",
];

interface ParticleData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: "circle" | "rect";
}

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    if (!active) return;
    const ps: ParticleData[] = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? "circle" : "rect",
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
    }));
    setParticles(ps);

    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      if (elapsed > 4500) {
        setParticles([]);
        return;
      }
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx + Math.sin(elapsed * 0.002 + p.id) * 0.8,
            y: p.y + p.vy,
            vy: p.vy + 0.05,
          }))
          .filter((p) => p.y < window.innerHeight + 40),
      );
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "fixed",
            left: p.x,
            top: p.y,
            width: p.shape === "circle" ? 10 : 14,
            height: p.shape === "circle" ? 10 : 7,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            background: p.color,
            pointerEvents: "none",
            zIndex: 9999,
            transform: `rotate(${p.x * 0.5}deg)`,
          }}
        />
      ))}
    </>
  );
}

export default function App() {
  const [forgiven, setForgiven] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const noPosRef = useRef<{ x: number; y: number } | null>(null);

  const BTN_W = 140;
  const BTN_H = 50;
  const MARGIN = 16;

  // Inicializar posición del botón No (esquina inferior derecha)
  useEffect(() => {
    const place = () => {
      const el = containerRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const pos = { x: width - BTN_W - MARGIN, y: height - BTN_H - MARGIN };
      noPosRef.current = pos;
      setNoPos(pos);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  const escape = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const maxX = width - BTN_W - MARGIN;
    const maxY = height - BTN_H - MARGIN;
    const cur = noPosRef.current ?? { x: maxX / 2, y: maxY / 2 };

    let newX = 0,
      newY = 0;
    // Buscar posición lejos de la actual
    for (let i = 0; i < 40; i++) {
      newX = MARGIN + Math.random() * (maxX - MARGIN);
      newY = MARGIN + Math.random() * (maxY - MARGIN);
      const dx = newX - cur.x;
      const dy = newY - cur.y;
      if (Math.sqrt(dx * dx + dy * dy) > 150) break;
    }
    newX = Math.max(MARGIN, Math.min(newX, maxX));
    newY = Math.max(MARGIN, Math.min(newY, maxY));
    const pos = { x: newX, y: newY };
    noPosRef.current = pos;
    setNoPos(pos);
  }, []);

  const handleYes = () => {
    setForgiven(true);
    setConfetti(true);
  };

  if (forgiven) {
    return (
      <>
        <Confetti active={confetti} />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #fff0f5 0%, #ffeef8 50%, #fff5f0 100%)",
            fontFamily: "'Georgia', serif",
            padding: "2rem",
          }}
        >
          <div
            style={{
              textAlign: "center",
              animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <div style={{ fontSize: 80, marginBottom: "1rem" }}>🎉</div>
            <h1
              style={{
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #D4537E, #f7a8c4, #ff6b9d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: "0 0 0.5rem",
                lineHeight: 1.2,
              }}
            >
              ¡Gracias!
            </h1>
            <p
              style={{
                fontSize: "1.3rem",
                color: "#a0607a",
                margin: "0 0 2rem",
                fontStyle: "italic",
              }}
            >
              La próxima te defenderé🌸
            </p>
            <div
              style={{
                fontSize: "2.5rem",
                letterSpacing: "10px",
                animation: "pulse 1s ease-in-out infinite alternate",
              }}
            >
              😊
            </div>
          </div>
        </div>
        <style>{`
          @keyframes popIn { from { opacity:0; transform:scale(0.3) rotate(-10deg); } to { opacity:1; transform:scale(1) rotate(0deg); } }
          @keyframes pulse { from { transform:scale(1); } to { transform:scale(1.12); } }
          * { box-sizing: border-box; } body { margin: 0; }
        `}</style>
      </>
    );
  }

  return (
    <>
      {/* Contenedor de referencia — ocupa toda la pantalla */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #fff0f5 0%, #ffeef8 60%, #fff5f0 100%)",
          fontFamily: "'Georgia', serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Blobs decorativos */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(212,83,126,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,107,157,0.07)",
            pointerEvents: "none",
          }}
        />

        {/* Card central */}
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(212,83,126,0.18)",
            borderRadius: 28,
            padding: "3rem 3.5rem",
            textAlign: "center",
            maxWidth: 400,
            width: "88%",
            boxShadow:
              "0 20px 60px rgba(212,83,126,0.13), 0 2px 12px rgba(0,0,0,0.04)",
            animation: "slideUp 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 56, marginBottom: "0.75rem" }}>🥺</div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#c2375f",
              margin: "0 0 0.5rem",
              lineHeight: 1.2,
            }}
          >
            ¿Me perdonas?
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#b07080",
              margin: "0 0 2.5rem",
              fontStyle: "italic",
            }}
          >
            Por fi :(
          </p>

          <button
            onClick={handleYes}
            style={{
              background: "linear-gradient(135deg, #D4537E, #ff6b9d)",
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "14px 52px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Georgia', serif",
              boxShadow: "0 8px 24px rgba(212,83,126,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Sí, te perdono
          </button>
        </div>

        {/* Botón No — flota por todo el contenedor */}
        {noPos !== null && (
          <button
            onMouseEnter={escape}
            onTouchStart={(e) => {
              e.preventDefault();
              escape();
            }}
            style={{
              position: "absolute",
              left: noPos.x,
              top: noPos.y,
              width: BTN_W,
              height: BTN_H,
              transition:
                "left 0.22s cubic-bezier(0.34,1.56,0.64,1), top 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              background: "rgba(255,255,255,0.92)",
              color: "#b07080",
              border: "1.5px solid rgba(212,83,126,0.35)",
              borderRadius: 12,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "not-allowed",
              fontFamily: "'Georgia', serif",
              boxShadow: "0 4px 20px rgba(212,83,126,0.15)",
              backdropFilter: "blur(6px)",
              userSelect: "none",
              zIndex: 20,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            No 🙅
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        * { box-sizing: border-box; } body { margin: 0; }
      `}</style>
    </>
  );
}
