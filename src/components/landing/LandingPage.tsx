"use client";

import { useLocale } from 'next-intl';
import Header from './Header';
import AnimatedBackground from './AnimatedBackground';
import Hero from './Hero';
import Features from './Features';
import Stats from './Stats';
import Testimonials from './Testimonials';
import CallToAction from './CallToAction';
import Footer from './Footer';
import LandingSkeleton from './LandingSkeleton';
import { useLandingContent } from '@/hooks/useLandingContent';

export default function LandingPage() {
  const { data, loading } = useLandingContent();
  const locale = useLocale();

  return (
    <div className="relative min-h-screen">
      <Header />
      <AnimatedBackground />
      {loading || !data ? (
        <LandingSkeleton />
      ) : (
        <>
          <Hero data={data.hero} locale={locale} />
          <Stats items={data.stats || []} />
          <Features items={data.features} />
          <Testimonials items={data.testimonials} />
          <CallToAction data={data.cta} />
        </>
      )}
      <Footer />
    </div>
  );
}

