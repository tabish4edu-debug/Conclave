import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeSectionEntry {
  id: string;
  theme: ThemeMode;
  element: HTMLElement;
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  activeSectionId: string;
  setTheme: (theme: ThemeMode) => void;
  registerSection: (id: string, theme: ThemeMode, element: HTMLElement) => () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: ThemeMode }> = ({
  children,
  initialTheme = 'light',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const sectionsRef = useRef<Map<string, ThemeSectionEntry>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, []);

  // Update body and root element attribute on initial mount and theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Set up intersection observer for registered sections
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Center focal band: triggers when section passes through the vertical middle of the viewport
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-30% 0px -35% 0px',
      threshold: [0, 0.1, 0.25, 0.5],
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Find the most intersecting section in the focal zone
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length === 0) return;

      // Sort by intersection ratio or proximity to center
      visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const topEntry = visibleEntries[0];

      const targetEl = topEntry.target as HTMLElement;
      const sectionTheme = targetEl.getAttribute('data-theme-mode') as ThemeMode;
      const sectionId = targetEl.id || targetEl.getAttribute('data-section-id') || '';

      if (sectionTheme && (sectionTheme === 'light' || sectionTheme === 'dark')) {
        setTheme(sectionTheme);
      }
      if (sectionId) {
        setActiveSectionId(sectionId);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    // Observe already registered elements
    sectionsRef.current.forEach((entry) => {
      if (entry.element && observerRef.current) {
        observerRef.current.observe(entry.element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setTheme]);

  const registerSection = useCallback(
    (id: string, sectionTheme: ThemeMode, element: HTMLElement) => {
      element.setAttribute('data-theme-mode', sectionTheme);
      element.setAttribute('data-section-id', id);

      sectionsRef.current.set(id, { id, theme: sectionTheme, element });
      if (observerRef.current) {
        observerRef.current.observe(element);
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.unobserve(element);
        }
        sectionsRef.current.delete(id);
      };
    },
    []
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        activeSectionId,
        setTheme,
        registerSection,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
