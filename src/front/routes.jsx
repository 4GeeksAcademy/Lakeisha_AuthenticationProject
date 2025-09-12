// Import necessary components and functions from react-router-dom.
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

// Import layout and page components
import Layout from "./pages/Layout";
import Home from "./pages/Home";


// Import authentication components
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Private from "./pages/Private";

// Import route protection component
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar in all views, add your new routes inside the containing Route.
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route
      path="/"
      element={<Layout />}
      errorElement={
        <div className="container mt-5">
          <div className="text-center">
            <h1 className="display-4 text-danger">404 - Page Not Found</h1>
            <p className="lead">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn btn-primary">
              🏠 Go Home
            </a>
          </div>
        </div>
      }
    >
      {/* Public Routes: Accessible to everyone */}
      <Route path="/" element={<Home />} />

      {/* Authentication Routes: Public access for login/signup */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes: Require authentication */}
      <Route
        path="/private"
        element={
          <ProtectedRoute>
            <Private />
          </ProtectedRoute>
        }
      />

      {/* Additional Protected Routes - Add more as needed */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Private />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="container mt-5">
              <h2>User Profile</h2>
              <p>This is a protected profile page. Add your profile component here.</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Settings Route - Protected */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="container mt-5">
              <h2>Settings</h2>
              <p>This is a protected settings page. Add your settings component here.</p>
            </div>
          </ProtectedRoute>
        }
      />
    </Route>
  )
);