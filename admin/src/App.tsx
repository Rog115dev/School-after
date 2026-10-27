import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SchoolsPage } from "./pages/SchoolsPage";
import { ContentPage } from "./pages/ContentPage";
import { SubtopicPage } from "./pages/SubtopicPage";
import { TopTipsPage } from "./pages/TopTipsPage";
import { StoriesPage } from "./pages/StoriesPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="content/subtopics/:id" element={<SubtopicPage />} />
        <Route path="stories" element={<StoriesPage />} />
        <Route path="top-tips" element={<TopTipsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
