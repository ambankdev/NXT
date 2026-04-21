import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'scale-in' | 'fade-in';
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set visible when entering, reset when leaving
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const animationMap: Record<string, React.CSSProperties> = {
    'fade-up': { transform: 'translateY(40px)' },
    'scale-in': { transform: 'scale(0.92)' },
    'fade-in': { transform: 'none' },
  };

  const visibleStyle: React.CSSProperties = {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
    transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
  };

  const hiddenStyle: React.CSSProperties = {
    opacity: 0,
    transition: 'none',
    ...animationMap[animation],
  };

  return (
    <div
      ref={ref}
      className={className}
      style={isVisible ? visibleStyle : hiddenStyle}
    >
      {children}
    </div>
  );
}