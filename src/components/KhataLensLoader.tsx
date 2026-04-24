type Shape = "circle" | "triangle" | "square";

function ShapeLoader({ shape }: { shape: Shape }) {
  return (
    <div className={`kl-shape kl-${shape}`}>
      <svg viewBox="0 0 80 80" aria-hidden>
        {shape === "circle" ? <circle cx="40" cy="40" r="28" /> : null}
        {shape === "triangle" ? <polygon points="40 11 69 64 11 64" /> : null}
        {shape === "square" ? <rect x="12" y="12" width="56" height="56" /> : null}
      </svg>
      <span className="kl-dot" />
    </div>
  );
}

export function KhataLensLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="kl-wrap" role="status" aria-live="polite" aria-label={label}>
      <div className="kl-row">
        <ShapeLoader shape="circle" />
        <ShapeLoader shape="triangle" />
        <ShapeLoader shape="square" />
      </div>
      <div className="kl-label">{label}</div>
    </div>
  );
}