'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface StockHeaderProps {
  onReceiveStock?: () => void;
}

export default function StockHeader({ onReceiveStock }: StockHeaderProps) {
  const t = useTranslations('inventory.stockList');
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      {onReceiveStock && (
        <Button onClick={onReceiveStock}>
          <Package className="mr-2 h-4 w-4" />
          Receive Stock
        </Button>
      )}
    </div>
  );
}

