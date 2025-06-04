import { getLocale } from "@/get-locales";
import { Locale } from "@/i18n-config";
import { LocaleDebugPanel } from "@/components/locale-debug-panel";

export default async function IndexPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const locale = await getLocale(lang);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{locale["friday"].title}</h1>
        <p className="text-lg text-muted-foreground">Current locale: {lang}</p>
        <p className="text-muted-foreground">
          This text is rendered on the server: {locale["friday"].welcome}
        </p>
      </div>
      
      <div className="mt-12">
        <LocaleDebugPanel />
      </div>
    </div>
  );
}
