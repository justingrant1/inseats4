import { ReactNode } from 'react';
import usePerformanceMonitoring from '@/hooks/usePerformanceMonitoring';

interface PerformanceProviderProps {
  children: ReactNode;
}

const PerformanceProvider = ({ children }: PerformanceProviderProps) => {
  usePerformanceMonitoring();
  return <>{children}</>;
};

export default PerformanceProvider;
