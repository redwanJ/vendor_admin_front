'use client';

import { useTranslations } from 'next-intl';

export default function StockHeader() {
  const t = useTranslations('inventory.stockList');
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}

