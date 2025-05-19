import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that scrolls the window to the top whenever
 * the pathname changes in the React Router location.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page when the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
