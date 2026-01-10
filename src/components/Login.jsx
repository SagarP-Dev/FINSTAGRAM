import { useState } from "react";
import { API_BASE_URL } from "../config";

function Login({ onSwitch, onLoginSuccess, setMessage }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setMessage({ text: "Please fill all fields", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data);
      } else {
        setMessage({
          text: data.message || "Invalid credentials",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage({ text: "Server offline", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #f5f7ff, #eef1ff);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border-radius: 20px;
          padding: 36px 28px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          text-align: center;
        }

        .logo {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 6px;
          background: linear-gradient(45deg,#4f46e5,#7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 28px;
        }

        .field {
          text-align: left;
          margin-bottom: 14px;
        }

        .field label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-left: 4px;
        }

        .field input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          font-size: 15px;
          margin-top: 6px;
          outline: none;
          background: #fafafa;
          transition: all 0.2s ease;
        }

        .field input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          margin-top: 18px;
          background: linear-gradient(to right,#4f46e5,#7c3aed);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, opacity 0.2s;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .footer {
          margin-top: 24px;
          font-size: 14px;
          color: #4b5563;
        }

        .link {
          color: #4f46e5;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .login-card {
            border-radius: 0;
            height: 100vh;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 40px 22px;
          }
        }
      `}</style>

      <div className="login-card">
        <div className="logo">finstagram</div>
        <div className="subtitle">Sign in to continue</div>

        <div className="field">
          <label>USERNAME</label>
          <input
            type="text"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>PASSWORD</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="footer">
          Don’t have an account?{" "}
          <span className="link" onClick={onSwitch}>
            Create one
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
