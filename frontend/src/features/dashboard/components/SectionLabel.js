/**
 * SectionLabel — Column header above a tile group.
 */
export default function SectionLabel({ children }) {
  return (
        <h2
      style={{
        color: "rgba(0,0,0,1)",
        fontSize: 13,
        fontWeight: 300,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: 10,
        marginTop: 0,
        paddingLeft: 2,
      }}
    >
      {children}
    </h2>
  );
}