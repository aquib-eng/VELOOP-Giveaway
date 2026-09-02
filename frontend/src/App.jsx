import { Routes, Route } from "react-router-dom";

// ==========================================
// COMMON COMPONENTS
// ==========================================

import Header from "./components/common/Header/Header";
import FAQ from "./components/common/FAQ/FAQ";
import Footer from "./components/common/Footer/Footer";

// ==========================================
// GIVEAWAY COMPONENTS
// ==========================================

import GiveawayHero from "./components/giveaway/GiveawayHero/GiveawayHero";
import CurrentGiveaway from "./components/giveaway/CurrentGiveaway/CurrentGiveaway";
import GiveawayRules from "./components/giveaway/GiveawayRules/GiveawayRules";

// ==========================================
// PRIZE COMPONENTS
// ==========================================

import PrizeGrid from "./components/prizes/PrizeGrid/PrizeGrid";

// ==========================================
// AUTH PAGES
// ==========================================

import Register from "./pages/auth/Register/Register";
import Login from "./pages/auth/Login/Login";
import Dashboard from "./pages/auth/Dashboard/Dashboard";

// ==========================================
// AUTH PROTECTION
// ==========================================

import ProtectedRoute from "./pages/auth/ProtectedRoute/ProtectedRoute";

// ==========================================
// GIVEAWAY PAGES
// ==========================================

import GiveawayDetails from "./pages/giveaway/GiveawayDetails/GiveawayDetails";

// ==========================================
// HOME PAGE
// ==========================================

function HomePage() {
  return (
    <>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main>
        <GiveawayHero />

        <CurrentGiveaway />

        <PrizeGrid />

        <GiveawayRules />

        <FAQ />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

// ==========================================
// APP
// ==========================================

function App() {
  return (
    <Routes>

      {/* ================================== */}
      {/* PUBLIC ROUTES */}
      {/* ================================== */}

      {/* Home */}
      <Route
        path="/"
        element={<HomePage />}
      />

      {/* Register */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Individual Giveaway */}
      <Route
        path="/giveaway/:id"
        element={<GiveawayDetails />}
      />

      {/* ================================== */}
      {/* PROTECTED ROUTES */}
      {/* ================================== */}

      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Route>

    </Routes>
  );
}

export default App;