import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { showError, showSuccess } from "@/lib/toast";

export function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      showSuccess(t("auth.loginSuccess"));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      showError(error);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <div className="mb-2 text-4xl">⚽</div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t("auth.loginTitle")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("auth.email")}
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t("auth.password")}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoggingIn}>
              {t("auth.signIn")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:underline"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
