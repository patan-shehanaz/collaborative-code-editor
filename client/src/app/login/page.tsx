"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            router.push("/");
        } catch (err) {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#09090b",
            }}
        >
            <div
                style={{
                    width: "350px",
                    padding: "24px",
                    borderRadius: "12px",
                    backgroundColor: "#18181b",
                }}
            >
                <h1
                    style={{
                        color: "white",
                        marginBottom: "20px",
                    }}
                >
                    Sign In
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "12px",
                        backgroundColor: "#27272a",
                        color: "white",
                        border: "1px solid #3f3f46",
                        borderRadius: "8px",
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "12px",
                        backgroundColor: "#27272a",
                        color: "white",
                        border: "1px solid #3f3f46",
                        borderRadius: "8px",
                    }}
                />

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </div>
        </div>
    );
}