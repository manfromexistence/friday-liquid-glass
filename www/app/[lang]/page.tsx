import { getLocale } from "@/get-locales";
import { Locale } from "@/i18n-config";
import { LtDemo } from "@/components/lt-demo";
import { LocaleInitializer } from "@/components/locale-initializer";

export default async function IndexPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const locale = await getLocale(lang);

  return (
    <>
      <LocaleInitializer locale={lang} data={locale} />
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{locale["friday"].title}</h1>
          <p className="text-muted-foreground">
            {locale["friday"].welcome}
          </p>
          <div className="text-sm text-muted-foreground">
            Current route locale: <code className="bg-muted px-2 py-1 rounded">{lang}</code>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <LtDemo />
          {/* <LocalePanel /> */}
        </div>
      </div>
    </>
  );
}
}
