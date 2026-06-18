import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useGames } from "@/hooks/useGames";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  Button,
  GameStatusBadge,
  PageSpinner,
} from "@/components/ui";
import type { Game } from "@/types";

function GameCard({ game }: { game: Game }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const date = new Date(game.dateTime);
  const playerCount = game.participants?.length ?? 0;

  return (
    <Link to={`/games/${game.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary-200">
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{game.title}</h3>
            <GameStatusBadge status={game.status} />
          </div>

          <div className="mb-3 space-y-1.5 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{game.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>
                {date.toLocaleDateString()}{" "}
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span>
                {game.pricePerHead > 0
                  ? `$${game.pricePerHead}/person`
                  : t("games.free")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
            <span className="text-slate-500">👤 {game.host.name}</span>
            <span
              className={`font-medium ${playerCount >= game.maxPlayers ? "text-red-500" : "text-secondary-600"}`}
            >
              {playerCount}/{game.maxPlayers}{" "}
              {t("games.players", { count: "" }).replace(" ", "")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function Games() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("");
  const { data: games, isLoading } = useGames(status);
  const { isAuthenticated } = useAuth();

  const filters = [
    { label: t("games.all"), value: "" },
    { label: t("games.open"), value: "OPEN" },
    { label: t("games.full"), value: "FULL" },
    { label: t("games.completed"), value: "COMPLETED" },
  ] as const;

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t("games.title")}
          </h1>
          <p className="text-sm text-slate-500">{t("games.subtitle")}</p>
        </div>
        {isAuthenticated && (
          <Link to="/games/new">
            <Button>+ {t("nav.createGame")}</Button>
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              status === f.value
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !games?.length ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="mb-2 text-4xl">⚽</div>
          <p className="text-slate-500">{t("games.noGames")}</p>
          {isAuthenticated && (
            <Link to="/games/new">
              <Button className="mt-4" variant="outline">
                {t("games.createFirst")}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
