import { useRef, useCallback } from 'react';

export const useScrollToPurchase = () => {
  const purchaseSectionRef = useRef<HTMLDivElement>(null);

  const scrollToPurchase = useCallback(() => {
    if (window.innerWidth < 768 && purchaseSectionRef.current) {
      purchaseSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    purchaseSectionRef,
    scrollToPurchase,
  };
};
