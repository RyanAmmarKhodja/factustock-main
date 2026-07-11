/**
 * MiniBarChart — decorative bar chart used in the weekly report tile.
 */
export default function MiniBarChart({ bars = [0.4, 0.6, 0.5, 0.9] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: `${h * 100}%`,
            borderRadius: 2,
            backgroundColor:
              i === bars.length - 1 ? "#f59e0b" : "rgba(255,255,255,0.18)",
          }}
        />
      ))}
    </div>
  );
}