import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Fix: Use Vite environment variables
    const getBackendUrl = () => {
        // Use Vite environment variable
        if (import.meta.env.VITE_BACKEND_URL) {
            return import.meta.env.VITE_BACKEND_URL;
        }

        // Fallback: construct URL based on current location
        const currentUrl = window.location.href;
        if (currentUrl.includes('3000')) {
            return currentUrl.replace('3000.app.github.dev', '3001.app.github.dev').split('/')[0] + '//' + currentUrl.split('//')[1].split('/')[0].replace('3000', '3001');
        }

        // Default fallback
        return 'http://localhost:3001';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const backendUrl = getBackendUrl();
            console.log("Using backend URL:", backendUrl); // Debug log

            const response = await fetch(`${backendUrl}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Save the token and user data
                sessionStorage.setItem("token", data.token);
                if (data.user) {
                    sessionStorage.setItem("user", JSON.stringify(data.user));
                }

                console.log("Login successful! Token saved:", data.token);

                // Redirect to protected dashboard
                navigate("/dashboard");
            } else {
                // Handle login errors
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Login</h2>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        "Login"
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <p>Don't have an account? <a href="/signup">Sign up here</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;