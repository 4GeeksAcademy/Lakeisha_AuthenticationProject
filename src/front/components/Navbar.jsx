import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if user is logged in
        const token = sessionStorage.getItem("token");
        const userData = sessionStorage.getItem("user");

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (err) {
                console.error("Error parsing user data:", err);
                handleLogout();
            }
        }
    }, [location.pathname]); // Re-check when route changes

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // Clear local state
        setUser(null);

        // Redirect to home
        navigate("/");

        // Optional: Reload page to update components
        window.location.reload();
    };

    const isAuthenticated = !!user;
    const isCurrentPath = (path) => location.pathname === path;

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    🔐 Auth App
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isCurrentPath("/") ? "active" : ""}`}
                                to="/"
                            >
                                Home
                            </Link>
                        </li>

                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${isCurrentPath("/private") ? "active" : ""}`}
                                    to="/private"
                                >
                                    Dashboard
                                </Link>
                            </li>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        {!isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isCurrentPath("/login") ? "active" : ""}`}
                                        to="/login"
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${isCurrentPath("/signup") ? "active" : ""}`}
                                        to="/signup"
                                    >
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    👤 {user.email}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li>
                                        <Link className="dropdown-item" to="/private">
                                            🏠 Dashboard
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger"
                                            onClick={handleLogout}
                                        >
                                            🚪 Logout
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;