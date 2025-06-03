import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/languages';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('friday.title')}</h1>
        <LanguageSwitcher />
      </div>
      
      <div className="space-y-6">
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">{t('friday.welcome')}</h2>
          <p className="text-muted-foreground">{t('friday.prompt')}</p>
        </section>

        <section className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">{t('navigation.dashboard')}</h3>
          <nav className="flex flex-wrap gap-4">
            <a href="#" className="text-primary hover:underline">{t('navigation.home')}</a>
            <a href="#" className="text-primary hover:underline">{t('navigation.projects')}</a>
            <a href="#" className="text-primary hover:underline">{t('navigation.automations')}</a>
            <a href="#" className="text-primary hover:underline">{t('navigation.library')}</a>
            <a href="#" className="text-primary hover:underline">{t('navigation.settings')}</a>
          </nav>
        </section>

        <section className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">{t('friday.help')}</p>
        </section>
      </div>
    </div>
  );
}
