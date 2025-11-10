'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface BookingsHeaderProps {
  title?: string;
  description?: string;
  onAdd: () => void;
}

export default function BookingsHeader({ title, description, onAdd }: BookingsHeaderProps) {
  const t = useTranslations('bookings');
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title ?? t('title')}</h1>
        <p className="text-muted-foreground">{description ?? t('description')}</p>
      </div>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        {t('actions.add')}
      </Button>
    </div>
  );
}
