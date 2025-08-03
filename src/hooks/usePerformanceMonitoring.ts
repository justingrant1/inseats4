import { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log Core Web Vitals
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
        }
      });
    });

    // Observe navigation and resource timing
    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });

    // Web Vitals tracking
    const trackWebVital = (metric: PerformanceMetric) => {
      // In a real app, you'd send this to your analytics service
      console.log(`Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
      });
    };

    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime: number;
        loadTime: number;
      };
      
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      trackWebVital({
        name: 'LCP',
        value: lcp,
        rating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const fid = (entry as any).processingStart - entry.startTime;
        trackWebVital({
          name: 'FID',
          value: fid,
          rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
        });
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Report CLS when the page is about to be unloaded
    const reportCLS = () => {
      trackWebVital({
        name: 'CLS',
        value: clsValue,
        rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
      });
    };

    window.addEventListener('beforeunload', reportCLS);

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      window.removeEventListener('beforeunload', reportCLS);
    };
  }, []);
};

export default usePerformanceMonitoring;
