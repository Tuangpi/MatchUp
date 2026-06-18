import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useCreateGame } from "@/hooks/useGames";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { showError, showSuccess } from "@/lib/toast";

export function CreateGame() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createGame = useCreateGame();

  const [form, setForm] = useState({
    title: "",
    location: "",
    dateTime: "",
    maxPlayers: 10,
    teamAPlayers: 5,
    teamBPlayers: 5,
    pricePerHead: 0,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const game = await createGame.mutateAsync({
        ...form,
        dateTime: new Date(form.dateTime).toISOString(),
      });
      showSuccess(t("createGame.createSuccess"));
      navigate(`/games/${game.id}`);
    } catch (error) {
      showError(error);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {t("createGame.title")}
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          {t("createGame.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t("createGame.gameTitle")}
            placeholder={t("createGame.titlePlaceholder")}
            value={form.title}
            onChange={set("title")}
            required
          />
          <Input
            label={t("createGame.location")}
            placeholder={t("createGame.locationPlaceholder")}
            value={form.location}
            onChange={set("location")}
            required
          />
          <Input
            label={t("createGame.dateTime")}
            type="datetime-local"
            value={form.dateTime}
            onChange={set("dateTime")}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t("createGame.maxPlayers")}
              type="number"
              min={2}
              max={30}
              value={form.maxPlayers}
              onChange={set("maxPlayers")}
            />
            <Input
              label={t("createGame.teamAPlayers")}
              type="number"
              min={1}
              max={15}
              value={form.teamAPlayers}
              onChange={set("teamAPlayers")}
            />
            <Input
              label={t("createGame.teamBPlayers")}
              type="number"
              min={1}
              max={15}
              value={form.teamBPlayers}
              onChange={set("teamBPlayers")}
            />
          </div>

          <Input
            label={t("createGame.pricePerHead")}
            type="number"
            min={0}
            step={0.5}
            value={form.pricePerHead}
            onChange={set("pricePerHead")}
          />
          <Input
            label={t("createGame.notes")}
            placeholder={t("createGame.notesPlaceholder")}
            value={form.notes}
            onChange={set("notes")}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={createGame.isPending}
          >
            {t("createGame.create")}
          </Button>
        </form>
      </div>
    </div>
  );
}
