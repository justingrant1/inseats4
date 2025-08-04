import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that scrolls the window to the top whenever
 * the pathname changes in the React Router location.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready and painted
    const scrollToTop = () => {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // Use instant to avoid any animation delay
        });
      });
    };

    // Execute immediately for route changes
    scrollToTop();
  }, [pathname]);

  return null;
}

export default ScrollToTop;
