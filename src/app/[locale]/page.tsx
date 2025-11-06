'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  TrendingUp,
  Bell,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  const features = [
    {
      icon: Package,
      titleKey: 'landing.features.serviceManagement.title',
      descriptionKey: 'landing.features.serviceManagement.description',
    },
    {
      icon: Calendar,
      titleKey: 'landing.features.bookingSystem.title',
      descriptionKey: 'landing.features.bookingSystem.description',
    },
    {
      icon: Users,
      titleKey: 'landing.features.customerManagement.title',
      descriptionKey: 'landing.features.customerManagement.description',
    },
    {
      icon: TrendingUp,
      titleKey: 'landing.features.analytics.title',
      descriptionKey: 'landing.features.analytics.description',
    },
    {
      icon: Bell,
      titleKey: 'landing.features.notifications.title',
      descriptionKey: 'landing.features.notifications.description',
    },
    {
      icon: LayoutDashboard,
      titleKey: 'landing.features.dashboard.title',
      descriptionKey: 'landing.features.dashboard.description',
    },
  ];

  const benefits = [
    'landing.benefits.benefit1',
    'landing.benefits.benefit2',
    'landing.benefits.benefit3',
    'landing.benefits.benefit4',
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">MH</span>
            </div>
            <span className="text-lg font-bold">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href={`/${locale}/login`}>
              <Button variant="ghost">{t('landing.header.login')}</Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button>{t('landing.header.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/register`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t('landing.hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/login`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t('landing.hero.login')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{t(feature.titleKey)}</CardTitle>
                    <CardDescription>{t(feature.descriptionKey)}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('landing.benefits.title')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('landing.benefits.subtitle')}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefitKey, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{t(benefitKey)}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/register`}>
                <Button size="lg">
                  {t('landing.benefits.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center space-y-4">
                <LayoutDashboard className="h-24 w-24 mx-auto text-primary/40" />
                <p className="text-sm text-muted-foreground">{t('landing.benefits.imageAlt')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('landing.cta.title')}
            </h2>
            <p className="text-lg opacity-90">
              {t('landing.cta.subtitle')}
            </p>
            <Link href={`/${locale}/register`}>
              <Button size="lg" variant="secondary">
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">MH</span>
              </div>
              <span className="font-semibold">{t('app.name')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {t('app.name')}. {t('common.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
