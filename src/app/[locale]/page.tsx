import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">{t('app.name')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('app.welcome')} {t('app.description')}
        </p>
      </div>
    </main>
  );
}
