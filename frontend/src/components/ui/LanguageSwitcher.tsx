import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === "my" ? "en" : "my";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
      title="Switch language"
    >
      {i18n.language === "my" ? "EN" : "MM"}
    </button>
  );
}
