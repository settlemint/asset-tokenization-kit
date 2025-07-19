import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Custom hook to detect scroll position and show blur effects on left/right edges
 * Used in scrollable containers to indicate more content is available
 */
export function useScrollBlur(
  scrollContainerRef: RefObject<HTMLDivElement | null>
) {
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);

  // Check if there's content to scroll and update blur states
  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // Show left blur if scrolled to the right
      setShowLeftBlur(scrollLeft > 0);

      // Show right blur if there's more content to scroll to the right
      // Add a small buffer (1px) to account for rounding errors
      setShowRightBlur(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, [scrollContainerRef]);

  // Set up ResizeObserver to monitor container size
  // React Compiler ensures checkScroll maintains a stable reference
  useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(scrollContainerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [scrollContainerRef, checkScroll]);

  return {
    showLeftBlur,
    showRightBlur,
    checkScroll,
  };
}
