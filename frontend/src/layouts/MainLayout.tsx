import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary-600 ${
      isActive ? "text-primary-600" : "text-slate-600"
    }`;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary-600"
          >
            <span className="text-2xl">⚽</span>
            <span>MatchUp</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/games" className={navLinkClass}>
              Games
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/games/new" className={navLinkClass}>
                  Create Game
                </NavLink>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <NavLink to="/profile" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {user?.name}
                    </span>
                  </NavLink>
                  <LanguageSwitcher />
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Link to="/login">
                  <Button size="sm">Sign In</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="flex items-center p-2 md:hidden"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-3">
              <NavLink
                to="/games"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Games
              </NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={navLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/games/new"
                    className={navLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Game
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={`${navLinkClass({ isActive: false })} flex items-center gap-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user?.name}</span>
                  </NavLink>
                  <LanguageSwitcher />
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <LanguageSwitcher />
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm">Sign In</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container-page text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} MatchUp — Futsal Matchmaking Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
