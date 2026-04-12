import { Children, useState } from "react";

/**
 * DashboardTile — A standalone clickable tile button.
 *
 * Props:
 *   color       – background color (CSS string)
 *   onClick     – click handler
 */
export default function DashboardTile({
  children,
  backgroundColor = "#1a56ff",
  color,
  onClick,
  height = "fit-content",
}) {
  
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        color: color,
        backgroundColor: backgroundColor,
        borderRadius: 0,
        padding: "14px 14px 12px",
        border: "none",
        cursor: "pointer",
        height,
        width: "100%",
        overflow: "hidden",
        textAlign: "center",
        transition: "transform 0.15s ease, filter 0.15s ease",
        transform: hovered ? "scale(1.016)" : "scale(1)",
        filter: hovered ? "brightness(1.12)" : "brightness(1)",
        outline: "none",
        boxSizing: "border-box",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Verdana",
        
      }}
    >
      {children}
    </button>
  );
}
