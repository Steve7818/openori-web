interface LogoPlaceholderProps {
  size?: number;
  className?: string;
}

export default function LogoPlaceholder({
  size = 48,
  className = "",
}: LogoPlaceholderProps) {
  const center = size / 2;
  const radius = size / 2 - 2;
  const lineLength = radius * 0.65;

  const lines = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    return {
      x1: center + Math.cos(angle) * lineLength * 0.25,
      y1: center + Math.sin(angle) * lineLength * 0.25,
      x2: center + Math.cos(angle) * lineLength,
      y2: center + Math.sin(angle) * lineLength,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#1A1A1A"
        strokeWidth={2}
      />
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#1A1A1A"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}
