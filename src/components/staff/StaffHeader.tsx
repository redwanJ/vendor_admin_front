'use client';

import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface StaffHeaderProps {
  title?: string;
  description?: string;
  onInvite: () => void;
}

export default function StaffHeader({ title, description, onInvite }: StaffHeaderProps) {
  const t = useTranslations('staff');
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title ?? t('title')}</h1>
        <p className="text-muted-foreground">{description ?? t('description')}</p>
      </div>
      <Button onClick={onInvite}>
        <UserPlus className="h-4 w-4 mr-2" />
        {t('actions.invite')}
      </Button>
    </div>
  );
}
