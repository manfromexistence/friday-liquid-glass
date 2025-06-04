import { getLocale } from "@/get-locales";
import { Locale } from "@/i18n-config";

export default async function IndexPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const locale = await getLocale(lang);

  return (
    <div>
      <div>
        <p>Current locale: {lang}</p>
        <p>
          This text is rendered on the server:{" "}
          {locale["friday"].welcome}
        </p>
        {locale["friday"].title}
      </div>
    </div>
  );
}
