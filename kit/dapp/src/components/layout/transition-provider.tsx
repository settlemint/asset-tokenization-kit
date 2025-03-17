'use client';

import { usePathname } from '@/i18n/routing';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface TransitionProviderProps {
  children: ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  // Keep track of previous state
  const prevLocaleRef = useRef(locale);
  const prevPathRef = useRef(pathname);

  // Track if this is a language change vs a normal navigation
  const [isLanguageChange, setIsLanguageChange] = useState(false);

  // This key is used to trigger animations ONLY when locale changes
  const routeKey = `${locale}-${isLanguageChange ? Math.random() : ''}`;

  // We use this to prevent animation on initial load
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // After component mounts, we're no longer on initial render
    setIsInitialRender(false);
  }, []);

  useEffect(() => {
    // If the locale changed but the path is the same, it's a language change
    if (
      !isInitialRender &&
      locale !== prevLocaleRef.current &&
      pathname === prevPathRef.current
    ) {
      setIsLanguageChange(true);
    } else {
      setIsLanguageChange(false);
    }

    // Update refs with current values
    prevLocaleRef.current = locale;
    prevPathRef.current = pathname;
  }, [locale, pathname, isInitialRender]);

  // If it's not a language change or initial render, don't apply animations
  if (isInitialRender || !isLanguageChange) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1, ease: 'easeInOut' }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
