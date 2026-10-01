import React, { useEffect, useRef } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

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
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cleanup = registerSection(id, theme, sectionRef.current);
    return cleanup;
  }, [id, theme, registerSection]);

  const themeClasses = applyContainerClasses
    ? theme === 'dark'
      ? 'text-[#F2EEE7] transition-colors duration-700 ease-in-out'
      : 'text-[#202124] transition-colors duration-700 ease-in-out'
    : '';

  return (
    <Component
      ref={sectionRef as any}
      id={id}
      data-theme-mode={theme}
      data-section-id={id}
      className={`${themeClasses} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};
