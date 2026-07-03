import { useEffect, useRef, useState, type ReactNode } from 'react';

type Animation = 'fade-up' | 'scale-in' | 'fade-in' | 'card-deal' | 'flip-in';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  easing?: string;
}

const animationStates: Record<Animation, { hidden: string; visible: string }> = {
  'fade-up':   { hidden: 'translateY(40px)',                                                                                visible: 'translateY(0) scale(1)' },
  'scale-in':  { hidden: 'scale(0.92)',                                                                                     visible: 'translateY(0) scale(1)' },
  'fade-in':   { hidden: 'none',                                                                                            visible: 'none' },
  'card-deal': { hidden: 'perspective(1200px) translateX(0) translateY(60px) rotateY(-35deg) rotateX(18deg) scale(0.8)', visible: 'perspective(1200px) translateX(0) translateY(0) rotateY(0deg) rotateX(0deg) scale(1)' },
  'flip-in':   { hidden: 'perspective(1200px) rotateY(-85deg) translateY(20px)',                                            visible: 'perspective(1200px) rotateY(0deg) translateY(0) scale(1)' },
};

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = false,
  easing = 'ease-out',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasRevealedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry.isIntersecting && !hasRevealedRef.current) {
            hasRevealedRef.current = true;
            setIsVisible(true);
            observer.disconnect();
          }
        } else {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const state = animationStates[animation];

  const visibleStyle: React.CSSProperties = {
    opacity: 1,
    transform: state.visible,
    transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`,
  };

  const hiddenStyle: React.CSSProperties = {
    opacity: 0,
    transform: state.hidden,
    transition: 'none',
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
