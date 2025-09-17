import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = result
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        validateAuthentication();
    }, []);

    // Get backend URL with fallback for Vite environment
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

    const validateAuthentication = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            const backendUrl = getBackendUrl();
            console.log("Validating token with backend:", backendUrl); // Debug log

            const response = await fetch(`${backendUrl}/api/validate-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setIsAuthenticated(true);
                console.log("Token validation successful");
            } else {
                // Token is invalid, clear session
                console.log("Token validation failed:", data.message || "Invalid token");
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