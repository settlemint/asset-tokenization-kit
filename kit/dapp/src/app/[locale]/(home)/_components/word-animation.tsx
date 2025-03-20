"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

function useWordCycle(interval: number) {
  const [index, setIndex] = useState(0);
  const [isInitial, setIsInitial] = useState(true);

  const t = useTranslations("homepage");

  const words = useMemo(
    () => [
      t("asset-tokenization"),
      t("stablecoins"),
      t("tokenized-deposits"),
      t("bonds-funds-equities"),
      t("cryptocurrencies"),
    ],
    [t]
  );

  useEffect(() => {
    if (isInitial) {
      setIndex(Math.floor(Math.random() * words.length));
      setIsInitial(false);
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, isInitial]);

  return words[index];
}

export function WordAnimation() {
  const word = useWordCycle(2100);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={word}
        className="text-accent inline-block font-bold text-5xl md:text-7xl"
      >
        {word?.split("").map((char, index) => (
          <motion.span
            key={`${word}-${char}-${index.toString()}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{
              duration: 0.15,
              delay: index * 0.015,
              ease: "easeOut",
            }}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
