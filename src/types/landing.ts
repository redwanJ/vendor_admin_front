export type LandingBadge = { label: string; icon?: string };
export type LandingHero = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  badges?: LandingBadge[];
};
export type LandingFeature = { title: string; description?: string; icon?: string };
export type LandingStat = { label: string; value: string };
export type LandingTestimonial = { quote: string; author: string; role?: string };
export type LandingCta = {
  title: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};
export type LandingContent = {
  hero: LandingHero;
  features: LandingFeature[];
  stats?: LandingStat[];
  testimonials?: LandingTestimonial[];
  cta?: LandingCta;
};

