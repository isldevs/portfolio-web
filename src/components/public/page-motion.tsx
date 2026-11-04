'use client';

import { useEffect, useRef } from 'react';

const targets = [
  '.hero > *',
  '.page-intro > *',
  '.section-block',
  '.aside-section',
  '.profile-section',
  '.terminal-panel',
  '.contact-panel',
  '.about-copy > *',
  '.project-card',
  '.article-card',
  '.case-card',
  '.skill-row',
  '.timeline-item',
].join(',');

export function PageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || !('IntersectionObserver' in window)) return;
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (preference.matches) continue;
          const animation = entry.target.animate(
            [
              { opacity: 0.65, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 460,
              delay: Math.min(stagger++ * 45, 180),
              easing: 'cubic-bezier(.22,1,.36,1)',
              fill: 'backwards',
            },
          );
          animations.add(animation);
          void animation.finished.then(
            () => animations.delete(animation),
            () => animations.delete(animation),
          );
        }
      },
      { threshold: 0.08 },
    );
    function observe() {
      container!.querySelectorAll(targets).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        // Reveal a whole section or its individual cards, never both at the same time.
        if (element.parentElement?.closest(targets)) return;
        observer.observe(element);
      });
    }
    function cancelMotion() {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    }
    observe();
    // Streamed content may arrive after the template hydrates.
    const mutations = new MutationObserver(observe);
    mutations.observe(container, { childList: true, subtree: true });
    preference.addEventListener('change', cancelMotion);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener('change', cancelMotion);
    };
  }, []);
  return (
    <div ref={root} className="route-stage">
      {children}
    </div>
  );
}
