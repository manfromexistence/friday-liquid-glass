import { getDictionary } from "@/get-locales";
import { Locale } from "@/i18n-config";

export default async function IndexPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <div>
      <div>
        <p>Current locale: {lang}</p>
        <p>
          This text is rendered on the server:{" "}
          {dictionary["friday"].welcome}
        </p>
        {dictionary["friday"].title}
      </div>
    </div>
  );
}
