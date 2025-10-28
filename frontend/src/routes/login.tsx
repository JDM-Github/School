import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequestHandler from "../lib/utilities/RequestHandler";
import { showToast } from "../components/toast";
import { useAuth } from "../context/auth";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email || !password) {
            setError("Please enter both email and password.");
            setLoading(false);
            return;
        }

        try {
            let response;

            if (role === "admin") {
                if (email === "admin@email.com" && password === "admin123") {
                    response = { success: true, token: "admin-token", user: {} };
                } else {
                    response = { success: false, message: "Invalid admin credentials." };
                }
            } else {
                response = await RequestHandler.fetchData("POST", "adviser/login", {
                    email,
                    password,
                });
            }
            if (!response.success) {
                setError(response.message || "Invalid credentials.");
                showToast(response.message || "Invalid credentials", "error");
                setLoading(false);
                return;
            }
            const roleType = role === "admin" ? "admin" : "teacher";
            login(response.token, { ...response.user, role: roleType });
            showToast("Login successful!", "success");
            setTimeout(() => {
                if (role === "teacher") navigate("/");
                else navigate("/");
            }, 1500);
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Something went wrong. Please try again.");
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                    <img
                        src="/icon.png"
                        alt="Logo"
                        className="w-40 mx-auto mb-2"
                    />
                    <h1 className="text-2xl font-bold text-blue-700">
                        Account Login
                    </h1>
                    <p className="text-sm text-gray-500">
                        Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium mb-1 text-gray-700"
                        >
                            Login As
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                        >
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-1 text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-1 text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex justify-center items-center"
                    >
                        {loading ? (
                            <span className="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-5 h-5"></span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="text-xs text-center text-gray-500 mt-4">
                    © {new Date().getFullYear()} Senior National High School
                </p>
            </div>
        </div>
    );
}
