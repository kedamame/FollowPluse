import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import RankingTable from "@/components/RankingTable";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RankingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("rankings.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("rankings.subtitle")}
          </p>
        </div>
        <RankingTable />
      </main>
    </>
  );
}
