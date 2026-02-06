import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(120deg, #484eed, #33c0ef)",
        fontFamily: "Arial",
      }}
    >
      <div style={{ textAlign: "center", background: "#b7f7c2", padding: 80, borderRadius: 12 }}>
        <h1 style={{ fontSize: 50, marginBottom: 10 }}>Welcome </h1>
        <p style={{ fontSize: 25  , marginBottom: 90 }}>
          Build modern apps using Next.js & TypeScript
        </p>
        <button
          style={{
            padding: "14px 32px",
            fontSize: 30,
            backgroundColor: "#e82525",
            color: "#ffffff",
            border: "none",
            borderRadius: 60,
            cursor: "pointer",
          }}
          onClick={() => router.push("/started")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
