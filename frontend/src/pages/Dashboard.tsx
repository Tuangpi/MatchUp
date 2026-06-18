import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  GameStatusBadge,
  PageSpinner,
} from "@/components/ui";

export function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!user) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-slate-500">Please sign in to view your dashboard</p>
        <Link to="/login">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, {user.name}!</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile summary */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Profile</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span>⭐</span> Rating: <strong>{user.rating}</strong>
            </div>
            {user.positions?.length > 0 && (
              <div className="flex items-center gap-2 text-slate-600">
                <span>🎯</span> Positions: {user.positions.join(", ")}
              </div>
            )}
            <Link to="/profile">
              <Button variant="outline" size="sm" className="mt-2">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* My hosted games */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">My Games (Host)</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.hostedGames?.length === 0 && (
              <p className="text-sm text-slate-400">No games hosted yet</p>
            )}
            {user.hostedGames?.map((g) => (
              <Link
                key={g.id}
                to={`/games/${g.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{g.title}</span>
                <GameStatusBadge status={g.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* My participations */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Joined Games</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.gameParticipations?.length === 0 && (
              <p className="text-sm text-slate-400">No games joined yet</p>
            )}
            {user.gameParticipations?.map((p) => (
              <Link
                key={p.id}
                to={`/games/${p.game.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">
                  {p.game.title}
                </span>
                <GameStatusBadge status={p.game.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
