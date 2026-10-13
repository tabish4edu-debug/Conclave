import React, { useEffect, useRef, useState } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useStudio } from '../../context/StudioContext';

export interface ScrollThemeSectionProps extends React.HTMLAttributes<HTMLElement> {
  theme: ThemeMode;
  id: string;
  as?: 'section' | 'div' | 'article';
  children: React.ReactNode;
  className?: string;
  applyContainerClasses?: boolean;
}

/**
 * ScrollThemeSection registers itself with the ThemeContext.
 * As the user scrolls and this section crosses the focal threshold of the viewport,
 * the ThemeContext automatically updates the global theme mode ('light' | 'dark').
 *
 * It also coordinates with StudioContext to apply a subtle fading-dissolve
 * page transition effect when targeted by activePage navigation.
 */
export const ScrollThemeSection: React.FC<ScrollThemeSectionProps> = ({
  theme,
  id,
  as: Component = 'section',
  children,
  className = '',
  applyContainerClasses = true,
  ...rest
}) => {
  const { registerSection } = useTheme();
  const { activePage } = useStudio();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [stage, setStage] = useState<'idle' | 'dissolving-in'>('idle');
  const prevActiveRef = useRef(activePage);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cleanup = registerSection(id, theme, sectionRef.current);
    return cleanup;
  }, [id, theme, registerSection]);

  // Subtle fading-dissolve effect when navigating to this section via activePage
  useEffect(() => {
    const isTarget =
      activePage === id ||
      ((activePage === 'home' || activePage === 'top') && (id === 'hero' || id === 'home'));

    if (isTarget && prevActiveRef.current !== activePage) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      if (!prefersReducedMotion) {
        setStage('dissolving-in');
        const timer = setTimeout(() => {
          setStage('idle');
        }, 280);
        prevActiveRef.current = activePage;
        return () => clearTimeout(timer);
      }
    }
    prevActiveRef.current = activePage;
  }, [activePage, id]);

  const themeClasses = applyContainerClasses
    ? theme === 'dark'
      ? 'text-[#F2EEE7] transition-colors duration-700 ease-in-out'
      : 'text-[#202124] transition-colors duration-700 ease-in-out'
    : '';

  const transitionClass = stage === 'dissolving-in' ? 'animate-fading-dissolve-in' : '';

  return (
    <Component
      ref={sectionRef as any}
      id={id}
      data-theme-mode={theme}
      data-section-id={id}
      data-transition-stage={stage}
      className={`${themeClasses} ${transitionClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
};
