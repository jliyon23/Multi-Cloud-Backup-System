import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userVerified = localStorage.getItem("verified");
    if (token) {
      // You might want to validate the token on the server before redirecting.
      navigate("/");
    }

    if (!userVerified) {
      navigate("/verify");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/login", { email, password });

      // Store token in localStorage
      localStorage.setItem("authToken", res.data.token);

      // Redirect to Dashboard
      navigate("/");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      console.error("Login error:", err); // Log the full error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-lg overflow-hidden border-[0.1px] border-zinc-700">
        <div className="p-8">
          <h1 className="text-2xl text-white font-bold text-center mb-6">Sign In</h1>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 rounded-md bg-[#282828] border border-zinc-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f0533e] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-md bg-[#282828] border border-zinc-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f0533e] focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-gray-300 font-semibold hover:text-[#ffa48f] transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#f0533e] hover:bg-[#f56952] text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa7e66] focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="py-4 px-8 bg-[#282828] text-center">
          <p className="text-gray-300 text-sm">
            Don't have an account?{" "}
            <a href="#" className="text-[#ffa48f] hover:text-[#ffb7a5] font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;