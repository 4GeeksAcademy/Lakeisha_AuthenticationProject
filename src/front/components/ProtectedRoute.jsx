import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = result
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        validateAuthentication();
    }, []);

    const validateAuthentication = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/validate-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setIsAuthenticated(true);
            } else {
                // Token is invalid, clear session
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Authentication validation error:", error);
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading spinner while validating
    if (isLoading) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Validating authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render protected content if authenticated
    return children;
};

export default ProtectedRoute;