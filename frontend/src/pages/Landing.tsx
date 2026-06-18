import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";

const features = [
  {
    icon: "🎯",
    title: "Find Players Instantly",
    desc: "No more begging friends to fill the squad. MatchUp connects you with local players ready for a game.",
  },
  {
    icon: "⚡",
    title: "Quick Match Setup",
    desc: "Create a game in seconds. Set the time, location, and team sizes — we handle the rest.",
  },
  {
    icon: "📊",
    title: "Track Performance",
    desc: "Build your player rating and track your game history. See your progress over time.",
  },
  {
    icon: "🤝",
    title: "Fair Team Balancing",
    desc: "Auto-balance teams based on player ratings for competitive and enjoyable matches.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Sign Up",
    desc: "Create your player profile with name, email, and preferred positions.",
  },
  {
    step: "02",
    title: "Find a Game",
    desc: "Browse open games near you or create your own match.",
  },
  {
    step: "03",
    title: "Join & Play",
    desc: "Pick your team side and show up. Rate players after the match.",
  },
];

export function Landing() {
  const { t } = useTranslation();
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-24 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="container-page relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="text-accent-400">🔥</span>
              <span>5v5 Futsal Matchmaking</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-100">
              {t("home.subtitle")}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-accent-500 text-primary-900 hover:bg-accent-400"
                >
                  {t("home.authCta")}
                </Button>
              </Link>
              <Link to="/games">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {t("home.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20" id="how-it-works">
        <div className="container-page">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">
              {t("home.howItWorks")}
            </h2>
            <p className="mx-auto max-w-xl text-slate-500">
              {t("home.howItWorksDesc")}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-700">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="bg-white py-20" id="features">
        <div className="container-page">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">
              {t("home.features")}
            </h2>
            <p className="mx-auto max-w-xl text-slate-500">
              {t("home.featuresDesc")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-100 bg-surface-muted p-6 transition-all hover:border-primary-200 hover:shadow-sm"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-1.5 font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-page">
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-14 text-center text-white shadow-xl">
            <h2 className="mb-4 text-3xl font-bold">{t("home.readyToPlay")}</h2>
            <p className="mb-8 text-primary-100">{t("home.readyToPlayDesc")}</p>
            <Link to="/login">
              <Button
                size="lg"
                className="bg-accent-500 text-primary-900 hover:bg-accent-400"
              >
                {t("home.createAccount")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
