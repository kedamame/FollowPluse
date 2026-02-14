"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const nextLocale = locale === "ja" ? "en" : "ja";
    const path = pathname.replace(`/${locale}`, `/${nextLocale}`) || `/${nextLocale}`;
    router.push(path);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <h1 className="text-lg font-bold text-purple-600">
          {t("common.appName")}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={switchLocale}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {locale === "ja" ? "EN" : "JA"}
          </button>
        </div>
      </div>
    </header>
  );
}
