import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, Card, CardContent, PageSpinner } from "@/components/ui";
import { showError, showSuccess } from "@/lib/toast";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export function Profile() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  if (isLoading) return <PageSpinner />;
  if (!user)
    return (
      <div className="container-page py-20 text-center text-slate-500">
        {t("profile.pleaseSignIn")}
      </div>
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/users/${userId}`, { name, phone });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      showSuccess(t("profile.saveSuccess"));
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {t("profile.title")}
        </h1>
        <p className="mb-8 text-sm text-slate-500">{t("profile.subtitle")}</p>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label={t("auth.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input label={t("profile.email")} value={user.email} disabled />
              <Input
                label={t("profile.phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("profile.phonePlaceholder")}
              />
              <Input
                label={t("profile.rating")}
                value={user.rating.toString()}
                disabled
              />
              <Button type="submit" isLoading={saving}>
                {t("profile.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
