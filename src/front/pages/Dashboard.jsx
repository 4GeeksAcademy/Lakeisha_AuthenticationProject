import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user data from sessionStorage
        const userData = sessionStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        // Clear all session data
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // Redirect to login
        navigate("/login");
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    {/* Welcome Header */}
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <h1 className="card-title text-success">
                                🎉 Welcome to Your Dashboard!
                            </h1>
                            <p className="card-text lead">
                                You are successfully logged in!
                            </p>
                            {user && (
                                <div className="alert alert-info">
                                    <strong>Hello, {user.name || user.email}!</strong>
                                    <br />
                                    <small>Email: {user.email}</small>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Profile</h5>
                                    <p className="card-text">Manage your account settings</p>
                                    <button className="btn btn-outline-primary">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Settings</h5>
                                    <p className="card-text">Configure your preferences</p>
                                    <button className="btn btn-outline-secondary">
                                        Open Settings
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Help</h5>
                                    <p className="card-text">Get support and documentation</p>
                                    <button className="btn btn-outline-info">
                                        Get Help
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Session Info (for debugging) */}
                    <div className="card mt-4">
                        <div className="card-header">
                            <h6 className="mb-0">Session Information</h6>
                        </div>
                        <div className="card-body">
                            <p><strong>Token Status:</strong>
                                <span className="badge bg-success ms-2">Active</span>
                            </p>
                            <p><strong>Login Time:</strong> {new Date().toLocaleString()}</p>
                            <small className="text-muted">
                                This protected page is only visible to authenticated users.
                            </small>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-danger"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;