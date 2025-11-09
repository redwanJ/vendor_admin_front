"use client";

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

type Social = { href: string; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> };

const socials: Social[] = [
  { href: 'https://github.com/menalhub', label: 'GitHub', icon: Github },
  { href: 'https://twitter.com/menalhub', label: 'Twitter', icon: Twitter },
  { href: 'https://linkedin.com/company/menalhub', label: 'LinkedIn', icon: Linkedin },
];

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socials.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          target="_blank"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground hover:border-primary/40"
        >
          <Icon className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
}

