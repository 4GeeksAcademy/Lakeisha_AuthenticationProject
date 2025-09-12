const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      message: null,
      demo: [
        {
          title: "FIRST",
          background: "white",
          initial: "white",
        },
        {
          title: "SECOND",
          background: "white",
          initial: "white",
        },
      ],
      currentUser: null,
      isAuthenticated: false,
    },
    actions: {
      // Use getActions to call a function within a function
      exampleFunction: () => {
        getActions().changeColor(0, "green");
      },

      getMessage: async () => {
        try {
          // fetching data from the backend
          const resp = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/hello`
          );
          const data = await resp.json();
          setStore({ message: data.message });
          // don't forget to return something, that is how the async resolves
          return data;
        } catch (error) {
          console.log("Error loading message from backend", error);
        }
      },

      changeColor: (index, color) => {
        //get the store
        const store = getStore();

        //we have to loop the entire demo array to look for the respective index
        //and change its color
        const demo = store.demo.map((elm, i) => {
          if (i === index) elm.background = color;
          return elm;
        });

        //reset the global store
        setStore({ demo: demo });
      },

      // Authentication actions
      setCurrentUser: (user) => {
        setStore({
          currentUser: user,
          isAuthenticated: !!user,
        });
      },

      checkAuth: () => {
        const token = sessionStorage.getItem("token");
        const userData = sessionStorage.getItem("user");

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            getActions().setCurrentUser(user);
            return true;
          } catch (error) {
            console.error("Error parsing user data:", error);
            getActions().logout();
            return false;
          }
        }
        return false;
      },

      login: async (email, password) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            // Store token and user data
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));

            // Update global state
            getActions().setCurrentUser(data.user);

            return { success: true, data };
          } else {
            return { success: false, error: data.error || "Login failed" };
          }
        } catch (error) {
          console.error("Login error:", error);
          return { success: false, error: "Network error" };
        }
      },

      signup: async (email, password) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/signup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            return { success: true, data };
          } else {
            return { success: false, error: data.error || "Signup failed" };
          }
        } catch (error) {
          console.error("Signup error:", error);
          return { success: false, error: "Network error" };
        }
      },

      logout: () => {
        // Clear session storage
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // Clear global state
        setStore({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      validateToken: async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
          getActions().logout();
          return false;
        }

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/validate-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );

          const data = await response.json();

          if (response.ok && data.valid) {
            getActions().setCurrentUser(data.user);
            return true;
          } else {
            getActions().logout();
            return false;
          }
        } catch (error) {
          console.error("Token validation error:", error);
          getActions().logout();
          return false;
        }
      },

      fetchProtectedData: async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
          return { success: false, error: "No token found" };
        }

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/protected`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();

          if (response.ok) {
            return { success: true, data };
          } else {
            return {
              success: false,
              error: data.error || "Failed to fetch protected data",
            };
          }
        } catch (error) {
          console.error("Protected data error:", error);
          return { success: false, error: "Network error" };
        }
      },
    },
  };
};

export default getState;
