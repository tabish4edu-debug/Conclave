import React, { useState, useEffect, useRef } from 'react';

export interface FadingDissolveTransitionProps {
  activeKey: string;
  children: React.ReactNode;
  className?: string;
  exitDurationMs?: number;
  enterDurationMs?: number;
  as?: React.ElementType;
}

/**
 * FadingDissolveTransition provides a refined, architectural 'fading-dissolve'
 * transition effect when switching between pages or sections.
 *
 * Implements two-phase React state management:
 * 1. 'dissolving-out': Current content fades out with a subtle blur and lift
 * 2. 'dissolving-in': Target content mounts and gently dissolves in with soft settling
 * 3. 'idle': Sits clean in the DOM without active animation overhead
 *
 * Automatically respects `prefers-reduced-motion`.
 */
export const FadingDissolveTransition: React.FC<FadingDissolveTransitionProps> = ({
  activeKey,
  children,
  className = '',
  exitDurationMs = 180,
  enterDurationMs = 260,
  as: Component = 'div',
}) => {
  const [displayedKey, setDisplayedKey] = useState<string>(activeKey);
  const [displayedChildren, setDisplayedChildren] = useState<React.ReactNode>(children);
  const [stage, setStage] = useState<'idle' | 'dissolving-out' | 'dissolving-in'>('idle');

  // Maintain ref to latest children to prevent stale closures during rapid key changes
  const latestChildrenRef = useRef<React.ReactNode>(children);
  latestChildrenRef.current = children;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If activeKey changed, orchestrate the two-phase fading dissolve
    if (activeKey !== displayedKey) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Check prefers-reduced-motion setting
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      if (prefersReducedMotion) {
        setDisplayedKey(activeKey);
        setDisplayedChildren(latestChildrenRef.current);
        setStage('idle');
        return;
      }

      // Phase 1: Exit dissolve
      setStage('dissolving-out');

      timerRef.current = setTimeout(() => {
        // Phase 2: Switch content and enter dissolve
        setDisplayedKey(activeKey);
        setDisplayedChildren(latestChildrenRef.current);
        setStage('dissolving-in');

        timerRef.current = setTimeout(() => {
          // Phase 3: Settle into idle state
          setStage('idle');
          timerRef.current = null;
        }, enterDurationMs);
      }, exitDurationMs);
    } else {
      // Same key: update children cleanly if child props change while key is static
      setDisplayedChildren(children);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeKey, displayedKey, children, exitDurationMs, enterDurationMs]);

  const animationClass =
    stage === 'dissolving-out'
      ? 'animate-fading-dissolve-out pointer-events-none'
      : stage === 'dissolving-in'
      ? 'animate-fading-dissolve-in'
      : '';

  return (
    <Component
      key={displayedKey}
      data-transition-stage={stage}
      data-active-key={displayedKey}
      className={`fading-dissolve-transition-root ${animationClass} ${className}`}
    >
      {displayedChildren}
    </Component>
  );
};
