import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ScrollThemeObserver is a global scroll listener that enhances the IntersectionObserver
 * by dynamically synchronizing CSS custom properties on document.body for ultra-smooth
 * transition of background colors, text colors, and image overlay opacities.
 */
export const ScrollThemeObserver: React.FC = () => {
  const { theme, activeSectionId } = useTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.style.setProperty('--current-bg', '#202124');
      root.style.setProperty('--current-text', '#F2EEE7');
      root.style.setProperty('--current-text-muted', '#D6CBBE');
      root.style.setProperty('--current-border', '#3A3C3E');
      root.style.setProperty('--current-overlay-opacity', '0.42');
      root.style.setProperty('--current-card-bg', '#2B2D2F');
      body.setAttribute('data-theme', 'dark');
    } else {
      root.style.setProperty('--current-bg', '#F2EEE7');
      root.style.setProperty('--current-text', '#202124');
      root.style.setProperty('--current-text-muted', '#8C8276');
      root.style.setProperty('--current-border', '#D6CBBE');
      root.style.setProperty('--current-overlay-opacity', '0.08');
      root.style.setProperty('--current-card-bg', '#E8E2D8');
      body.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Keep active section state in sync with DOM dataset
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-active-section', activeSectionId);
    }
  }, [activeSectionId]);

  return null;
};
