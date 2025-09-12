import React from "react";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import your components
import Navbar from "../components/Navbar";

// Import context provider for global state management
//import injectContext from "../store/appContext";

const Layout = () => {
    // Check for backend URL and show warning if not set
    if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">⚠️ Backend URL Missing!</h4>
                    <p>Please set your <code>VITE_BACKEND_URL</code> environment variable.</p>
                    <hr />
                    <p className="mb-0">
                        Create a <code>.env</code> file in your project root with:
                        <br />
                        <code>VITE_BACKEND_URL=http://localhost:3001</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow-1">
                {/* This is where your page components will render */}
                <Outlet />
            </main>
        </div>
    );
};

// Export the Layout component
export default Layout;