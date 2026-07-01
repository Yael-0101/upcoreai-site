export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-obsidian"
      style={{
        backgroundImage: [
          "radial-gradient(620px circle at 12% 8%, rgba(200,98,61,0.20), transparent 62%)",
          "radial-gradient(700px circle at 88% 92%, rgba(138,154,133,0.16), transparent 60%)",
          "radial-gradient(520px circle at 52% 42%, rgba(200,98,61,0.07), transparent 60%)",
        ].join(","),
      }}
    />
  );
}
