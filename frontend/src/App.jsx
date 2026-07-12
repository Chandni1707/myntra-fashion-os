import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import StyleOnboarding from "./pages/StyleOnboarding";
import Dashboard from "./pages/Dashboard";
import StyleProfile from "./pages/StyleProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import FashionCapture from "./pages/FashionCapture";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <StyleOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/style-profile"
          element={
            <ProtectedRoute>
              <StyleProfile />
            </ProtectedRoute>
          }
        />
        <Route
  path="/capture"
  element={
    <ProtectedRoute>
      <FashionCapture />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;