import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  useGame,
  useJoinGame,
  useLeaveGame,
  useDeleteGame,
} from "@/hooks/useGames";
import { useMessages, useMarkAttendance, useSocketChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  GameStatusBadge,
  PageSpinner,
  Badge,
  Input,
} from "@/components/ui";
import type { GameParticipation, Message } from "@/types";

function ChatSection({
  gameId,
  userId,
  participants,
}: {
  gameId: string;
  userId: string;
  participants: GameParticipation[];
}) {
  const { t } = useTranslation();
  const { data: initialMessages, isLoading } = useMessages(gameId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onNewMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const { connected, typingUsers, sendMessage, emitTyping } = useSocketChat({
    gameId,
    onNewMessage,
  });

  const participantMap = new Map(
    participants.map((p) => [p.userId, p.user?.name ?? "Unknown"]),
  );

  const typingNames = Array.from(typingUsers)
    .filter((id) => id !== userId)
    .map((id) => participantMap.get(id))
    .filter(Boolean) as string[];

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
    emitTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value) {
      emitTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => emitTyping(false), 2000);
    } else {
      emitTyping(false);
    }
  };

  if (!userId) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            {t("gameDetail.chat")}
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"}`}
            />
            {connected
              ? t("gameDetail.connected")
              : t("gameDetail.disconnected")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-80">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && (
              <p className="text-center text-sm text-slate-400">
                {t("gameDetail.loadingMessages")}
              </p>
            )}
            {!isLoading && messages.length === 0 && (
              <p className="text-center text-sm text-slate-400">
                {t("gameDetail.noMessages")}
              </p>
            )}
            {messages.map((msg) => {
              const isOwn = msg.userId === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                      isOwn
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {!isOwn && (
                      <p className="mb-0.5 text-xs font-medium text-primary-600">
                        {msg.user.name}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={`mt-0.5 text-[10px] ${
                        isOwn ? "text-primary-200" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            {typingNames.length > 0 && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  {typingNames.join(", ")}{" "}
                  {typingNames.length === 1
                    ? t("gameDetail.isTyping")
                    : t("gameDetail.areTyping")}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-slate-200 p-3"
          >
            <input
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder={t("gameDetail.chatPlaceholder")}
              value={input}
              onChange={handleInputChange}
            />
            <Button type="submit" size="sm" disabled={!input.trim()}>
              {t("gameDetail.send")}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceSection({
  gameId,
  participants,
  isHost,
  gameStatus,
}: {
  gameId: string;
  participants: GameParticipation[];
  isHost: boolean;
  gameStatus: string;
}) {
  const { t } = useTranslation();
  const markAttendance = useMarkAttendance();
  const [selected, setSelected] = useState<
    Record<string, "PRESENT" | "ABSENT">
  >({});

  // Initialize selections from current attendance status
  useEffect(() => {
    const initial: Record<string, "PRESENT" | "ABSENT"> = {};
    participants.forEach((p) => {
      if (p.attendanceStatus === "PRESENT" || p.attendanceStatus === "ABSENT") {
        initial[p.id] = p.attendanceStatus;
      }
    });
    setSelected(initial);
  }, [participants]);

  const handleMarkAllPresent = () => {
    const all: Record<string, "PRESENT" | "ABSENT"> = {};
    participants.forEach((p) => {
      all[p.id] = "PRESENT";
    });
    setSelected(all);
  };

  const handleSubmitAttendance = async () => {
    const attendees = Object.entries(selected).map(
      ([participantId, attendanceStatus]) => ({
        participantId,
        attendanceStatus,
      }),
    );
    try {
      await markAttendance.mutateAsync({ gameId, attendees });
      showSuccess(t("gameDetail.attendanceSaved"));
    } catch (error) {
      showError(error);
    }
  };

  if (!isHost || gameStatus !== "IN_PROGRESS") return null;

  const hasPending = participants.some((p) => !selected[p.id]);

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-slate-900">
          {t("gameDetail.attendance")}
        </h3>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <p className="text-xs text-slate-500">
          {t("gameDetail.attendanceHint")}
        </p>
        {participants.length === 0 && (
          <p className="text-sm text-slate-400">{t("gameDetail.noPlayers")}</p>
        )}
        <div className="space-y-2">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
            >
              <span className="text-sm text-slate-700">
                {p.user?.name ?? "Unknown"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [p.id]: "PRESENT" }))
                  }
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    selected[p.id] === "PRESENT"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  ✓ {t("gameDetail.present")}
                </button>
                <button
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [p.id]: "ABSENT" }))
                  }
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    selected[p.id] === "ABSENT"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  ✗ {t("gameDetail.absent")}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={participants.length === 0}
          >
            {t("gameDetail.allPresent")}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitAttendance}
            isLoading={markAttendance.isPending}
            disabled={!hasPending}
          >
            {t("gameDetail.saveAttendance")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GameDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: game, isLoading } = useGame(id!);
  const { user } = useAuth();
  const userId = user?.id;
  const joinGame = useJoinGame();
  const leaveGame = useLeaveGame();
  const deleteGame = useDeleteGame();

  if (isLoading) return <PageSpinner />;
  if (!game) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-slate-500">{t("gameDetail.notFound")}</p>
        <Link to="/games">
          <Button className="mt-4" variant="outline">
            {t("gameDetail.backToGames")}
          </Button>
        </Link>
      </div>
    );
  }

  const date = new Date(game.dateTime);
  const isHost = userId === game.hostId;
  const myParticipation = game.participants?.find((p) => p.userId === userId);
  const teamAPlayers =
    game.participants?.filter((p) => p.team === "TEAM_A") ?? [];
  const teamBPlayers =
    game.participants?.filter((p) => p.team === "TEAM_B") ?? [];
  const isOpen = game.status === "OPEN";

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <Link to="/games" className="text-sm text-primary-600 hover:underline">
          {t("gameDetail.backToGames")}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info + Chat */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {game.title}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("gameDetail.hostedBy")} {game.host.name}
                  </p>
                </div>
                <GameStatusBadge status={game.status} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>📍</span> {game.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>📅</span> {date.toLocaleDateString()}{" "}
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>💰</span>{" "}
                    {game.pricePerHead > 0
                      ? `$${game.pricePerHead}/person`
                      : t("games.free")}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>👥</span> {game.maxPlayers}{" "}
                    {t("gameDetail.maxPlayers")}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>⚪</span> {game.teamAPlayers}{" "}
                    {t("gameDetail.perTeamA")}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>🔵</span> {game.teamBPlayers}{" "}
                    {t("gameDetail.perTeamB")}
                  </div>
                </div>
              </div>

              {game.notes && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">
                    {t("gameDetail.notes")}
                  </p>
                  <p className="mt-1">{game.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Section */}
          {userId && myParticipation && (
            <ChatSection
              gameId={game.id}
              userId={userId}
              participants={game.participants ?? []}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardContent className="p-5 space-y-3">
              {!userId ? (
                <Link to="/login">
                  <Button className="w-full">
                    {t("gameDetail.signInView")}
                  </Button>
                </Link>
              ) : isHost ? (
                <>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={async () => {
                      try {
                        await deleteGame.mutateAsync(game.id);
                        showSuccess(t("gameDetail.deleteSuccess"));
                        navigate("/games");
                      } catch (error) {
                        showError(error);
                      }
                    }}
                    isLoading={deleteGame.isPending}
                  >
                    {t("gameDetail.deleteGame")}
                  </Button>
                </>
              ) : myParticipation ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await leaveGame.mutateAsync(game.id);
                      showSuccess(t("gameDetail.leaveSuccess"));
                    } catch (error) {
                      showError(error);
                    }
                  }}
                  isLoading={leaveGame.isPending}
                >
                  {t("gameDetail.leaveGame")}
                </Button>
              ) : isOpen ? (
                <>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        await joinGame.mutateAsync({
                          gameId: game.id,
                          team: "TEAM_A",
                        });
                        showSuccess(t("gameDetail.joinSuccess"));
                      } catch (error) {
                        showError(error);
                      }
                    }}
                    isLoading={joinGame.isPending}
                  >
                    {t("gameDetail.joinTeamA")}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await joinGame.mutateAsync({
                          gameId: game.id,
                          team: "TEAM_B",
                        });
                        showSuccess(t("gameDetail.joinSuccess"));
                      } catch (error) {
                        showError(error);
                      }
                    }}
                    isLoading={joinGame.isPending}
                  >
                    {t("gameDetail.joinTeamB")}
                  </Button>
                </>
              ) : (
                <p className="text-center text-sm text-slate-500">
                  This game is {game.status.toLowerCase()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Attendance */}
          <AttendanceSection
            gameId={game.id}
            participants={game.participants ?? []}
            isHost={isHost}
            gameStatus={game.status}
          />

          {/* Players */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-semibold text-slate-900">
                {t("gameDetail.playersHeader", {
                  count: game.participants?.length ?? 0,
                })}
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-slate-400">
                    {t("gameDetail.teamA")}
                  </p>
                  {teamAPlayers.length === 0 && (
                    <p className="text-xs text-slate-400">
                      {t("gameDetail.noPlayers")}
                    </p>
                  )}
                  {teamAPlayers.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 py-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {p.user?.name?.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700">
                        {p.user?.name}
                      </span>
                      {p.attendanceStatus === "PRESENT" && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                      {p.attendanceStatus === "ABSENT" && (
                        <span className="text-xs text-red-600">✗</span>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-slate-400">
                    {t("gameDetail.teamB")}
                  </p>
                  {teamBPlayers.length === 0 && (
                    <p className="text-xs text-slate-400">
                      {t("gameDetail.noPlayers")}
                    </p>
                  )}
                  {teamBPlayers.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 py-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-700">
                        {p.user?.name?.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700">
                        {p.user?.name}
                      </span>
                      {p.attendanceStatus === "PRESENT" && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                      {p.attendanceStatus === "ABSENT" && (
                        <span className="text-xs text-red-600">✗</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
