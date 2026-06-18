import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { MainLayout } from "@/layouts/MainLayout";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Games } from "@/pages/Games";
import { GameDetail } from "@/pages/GameDetail";
import { CreateGame } from "@/pages/CreateGame";
import { Dashboard } from "@/pages/Dashboard";
import { Profile } from "@/pages/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          toastOptions={{
            className: "text-sm font-medium",
            style: {
              borderRadius: "8px",
              padding: "12px 16px",
            },
          }}
        />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/new" element={<CreateGame />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
