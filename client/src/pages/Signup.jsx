import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // You might want to validate the token on the server before redirecting.
      navigate("/");
    }
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/signup", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("email", formData.email);

      setSuccess(response.data.message); // Show success message
      setFormData({ fullName: "", email: "", password: "", confirmPassword: "" }); // Reset form

      navigate("/verify");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!");
      console.error("Signup error:", err); // Log the full error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-lg overflow-hidden border-[0.1px] border-zinc-700">
        <div className="p-8">
          <h1 className="text-2xl text-white font-bold text-center mb-6">Create Account</h1>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full p-3 rounded-md bg-[#282828] border border-zinc-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f0533e] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full p-3 rounded-md bg-[#282828] border border-zinc-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f0533e] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full p-3 rounded-md bg-[#282828] border border-zinc-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f0533e] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full p-3 rounded-md bg-[#282828] border border-zinc-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f0533e] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#f0533e] hover:bg-[#f56952] text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa7e66] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="py-4 px-8 bg-[#282828] text-center">
          <p className="text-gray-300 text-sm">
            Already have an account?{" "}
            <a href="#" className="text-[#ffa48f] hover:text-[#ffb7a5] font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;