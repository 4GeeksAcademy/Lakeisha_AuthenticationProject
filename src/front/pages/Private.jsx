import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Private = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        validateToken();
    }, []);

    const validateToken = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/validate-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setUser(data.user);
            } else {
                // Token is invalid, redirect to login
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                navigate("/login");
            }
        } catch (err) {
            console.error("Token validation error:", err);
            setError("Failed to validate session");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // Redirect to login
        navigate("/login");

        // Optional: Reload page to update navbar
        window.location.reload();
    };

    const fetchProtectedData = async () => {
        const token = sessionStorage.getItem("token");

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/protected`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Protected data accessed! Message: ${data.message}`);
            } else {
                setError(data.error || "Failed to access protected data");
            }
        } catch (err) {
            console.error("Protected data error:", err);
            setError("Network error accessing protected data");
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Validating session...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>Private Dashboard</h1>
                        <button
                            className="btn btn-outline-danger"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Welcome!</h5>
                                </div>
                                <div className="card-body">
                                    <p className="card-text">
                                        🎉 Congratulations! You have successfully logged into the private area.
                                    </p>
                                    <p className="card-text">
                                        This page can only be accessed by authenticated users.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">User Information</h5>
                                </div>
                                <div className="card-body">
                                    {user && (
                                        <>
                                            <p><strong>Email:</strong> {user.email}</p>
                                            <p><strong>User ID:</strong> {user.id}</p>
                                            <p><strong>Account Status:</strong>
                                                <span className={`badge ms-2 ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                            <p><strong>Member Since:</strong> {
                                                user.created_at ?
                                                    new Date(user.created_at).toLocaleDateString() :
                                                    'N/A'
                                            }</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Protected Actions</h5>
                                </div>
                                <div className="card-body">
                                    <p className="card-text">
                                        Test the authentication system by accessing protected endpoints:
                                    </p>

                                    <button
                                        className="btn btn-primary me-2"
                                        onClick={fetchProtectedData}
                                    >
                                        Access Protected Data
                                    </button>

                                    <button
                                        className="btn btn-info me-2"
                                        onClick={() => window.location.reload()}
                                    >
                                        Refresh Page
                                    </button>

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate("/")}
                                    >
                                        Go to Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="alert alert-info">
                                <h6>🔒 Security Features Implemented:</h6>
                                <ul className="mb-0">
                                    <li>JWT token-based authentication</li>
                                    <li>Automatic token validation on page load</li>
                                    <li>Session timeout handling</li>
                                    <li>Protected route validation</li>
                                    <li>Secure logout functionality</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Private;