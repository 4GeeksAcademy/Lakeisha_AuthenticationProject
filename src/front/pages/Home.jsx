import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const userData = sessionStorage.getItem("user");
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (err) {
                console.error("Error parsing user data:", err);
            }
        }
    }, []);

    const isAuthenticated = !!user;

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    {/* Hero Section */}
                    <div className="jumbotron bg-primary text-white p-5 rounded mb-5">
                        <div className="container">
                            <h1 className="display-4">🔐 Authentication System</h1>
                            <p className="lead">
                                A complete user authentication system built with React.js and Flask
                            </p>
                            {!isAuthenticated ? (
                                <div className="mt-4">
                                    <Link className="btn btn-light btn-lg me-3" to="/signup">
                                        Get Started
                                    </Link>
                                    <Link className="btn btn-outline-light btn-lg" to="/login">
                                        Login
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <Link className="btn btn-light btn-lg" to="/private">
                                        Go to Dashboard
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Welcome Message for Authenticated Users */}
                    {isAuthenticated && (
                        <div className="alert alert-success mb-4" role="alert">
                            <h4 className="alert-heading">Welcome back, {user.email}! 👋</h4>
                            <p>You are currently logged in. Access your private dashboard to see protected content.</p>
                        </div>
                    )}

                    {/* Features Section */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <h2 className="text-center mb-4">Features</h2>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h3 className="card-title">🔐 Secure Registration</h3>
                                    <p className="card-text">
                                        Create your account with email and password validation. 
                                        Passwords are securely hashed before storage.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h3 className="card-title">🎫 JWT Authentication</h3>
                                    <p className="card-text">
                                        Login with your credentials and receive a secure JWT token 
                                        for accessing protected routes.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h3 className="card-title">🛡️ Protected Routes</h3>
                                    <p className="card-text">
                                        Access private content that's only available to 
                                        authenticated users with valid tokens.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works Section */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <h2 className="text-center mb-4">How It Works</h2>
                        </div>
                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">For New Users</h5>
                                    <ol className="list-group list-group-numbered list-group-flush">
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Sign Up:</strong> Create an account with your email and password
                                        </li>
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Verification:</strong> Your account is created and validated
                                        </li>
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Login:</strong> Use your credentials to access the system
                                        </li>
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Access:</strong> Enjoy protected content and features
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">For Returning Users</h5>
                                    <ol className="list-group list-group-numbered list-group-flush">
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Login:</strong> Enter your email and password
                                        </li>
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Authentication:</strong> Receive a secure access token
                                        </li>
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Navigate:</strong> Access private areas and content
                                        </li>
                                        <li className="list-group-item border-0 ps-0">
                                            <strong>Logout:</strong> Safely end your session when done
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Demo Section */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Try the Demo</h5>
                                    <p className="card-text">
                                        Want to test the system without creating an account? Use these demo credentials:
                                    </p>
                                    <div className="row justify-content-center">
                                        <div className="col-md-6">
                                            <div className="bg-white p-3 rounded">
                                                <strong>Demo Account:</strong><br />
                                                Email: <code>admin@test.com</code><br />
                                                Password: <code>admin123</code>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Link to="/login" className="btn btn-primary">
                                            Try Demo Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {!isAuthenticated && (
                        <div className="row">
                            <div className="col-12">
                                <div className="text-center">
                                    <h3>Ready to get started?</h3>
                                    <p className="text-muted">Choose an option below to begin</p>
                                    <Link to="/signup" className="btn btn-primary btn-lg me-3">
                                        Create Account
                                    </Link>
                                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;