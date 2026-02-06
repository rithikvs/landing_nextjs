import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "Arial", padding: "40px", textAlign: "center" }}>
      <h1>Hello</h1>

      <p>This is a simple landing page built using Next.js and TypeScript.</p>

      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#1daa16",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => router.push("/started")}
      >
        Get Started
      </button>
    </div>
  );
}
