import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ChatPage } from "./app/pages/chat";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import { LoginPage } from "./app/pages/login";
import { SignupPage } from "./app/pages/signup";
import { OnboardingScreen } from "./app/pages/onboarding";
import { BrowsePage } from "./app/pages/Browse";
import { ListingsPage } from "./app/pages/listings";
import { Navbar } from "./app/components/Navbar";
import { AnnouncementsPage } from "./app/pages/announcements";
import { ResourcesPage } from "./app/pages/resourcespage";
import { ProfilePage } from "./app/pages/Profile";
import { ViewListing } from "./app/pages/viewlistings";
import { MapPage } from "./app/pages/MapPage";
import { MatchesPage } from "./app/pages/matches";
import { ViewProfilePage } from "./app/pages/viewprofile";
import { ResourceDetailsPage } from "./app/pages/resource_details_page";

// Helper component to handle conditional Navbar rendering
const NavigationWrapper: React.FC<{ session: Session | null }> = ({
  session,
}) => {
  const location = useLocation();
  const hideNavbarPaths = ["/onboarding", "/login", "/signup"];
  const shouldShowNavbar =
    session && !hideNavbarPaths.includes(location.pathname);

  return shouldShowNavbar ? <Navbar /> : null;
};

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="grow">
          <Routes>
            {/* Auth Routes */}
            <Route
              path="/login"
              element={session ? <Navigate to="/browse" /> : <LoginPage />}
            />
            <Route
              path="/signup"
              element={session ? <Navigate to="/onboarding" /> : <SignupPage />}
            />

            {/* Protected Routes */}
            <Route
              path="/onboarding"
              element={
                session ? <OnboardingScreen /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/browse"
              element={session ? <BrowsePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/listings"
              element={session ? <ListingsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/announcements"
              element={
                session ? <AnnouncementsPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/resources"
              element={session ? <ResourcesPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/resources/:id"
              element={
                session ? <ResourceDetailsPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/map"
              element={session ? <MapPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={session ? <ProfilePage /> : <Navigate to="/login" />}
            />

            {/* ✅ ADD CHAT HERE */}
            <Route
              path="/chat"
              element={session ? <ChatPage /> : <Navigate to="/login" />}
            />

            {/* Other routes */}
            <Route
              path="/listing/:id"
              element={session ? <ViewListing /> : <Navigate to="/login" />}
            />
            <Route
              path="/matches"
              element={session ? <MatchesPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/viewprofile/:id"
              element={session ? <ViewProfilePage /> : <Navigate to="/login" />}
            />

            {/* Fallback Route MUST be last */}
            <Route
              path="*"
              element={<Navigate to={session ? "/browse" : "/login"} />}
            />
          </Routes>
        </div>

        <NavigationWrapper session={session} />
      </div>
    </Router>
  );
};
