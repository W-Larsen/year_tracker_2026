import { useEffect, useLayoutEffect } from 'react';
import { LAYOUT, TIMING, CSS_VARS } from '../constants';

/**
 * Custom hook to handle responsive layout scaling
 * Manages desktop canvas scaling and mobile responsive layout
 * @returns {void}
 */
export function useLayout() {
    useLayoutEffect(() => {
        // Call immediately (synchronous)
        updateLayout();

        // Call again after a tiny delay to catch any late renders
        const timeoutId = setTimeout(() => {
            updateLayout();
        }, TIMING.LAYOUT_RETRY_DELAY);

        window.addEventListener('resize', updateLayout);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateLayout);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Additional safety check after mount
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateLayout();
        }, TIMING.LAYOUT_FINAL_DELAY);

        return () => clearTimeout(timeoutId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Updates the layout based on viewport size
 * Handles both desktop (scaled canvas) and mobile (responsive) layouts
 */
function updateLayout() {
    const isMobile = window.innerWidth < LAYOUT.MOBILE_BREAKPOINT;
    document.body.classList.toggle('mobile-layout', isMobile);

    const wrapper = document.querySelector('.canvas-wrapper');
    const canvas = document.querySelector('.canvas-area');

    if (!wrapper || !canvas) return;

    if (isMobile) {
        resetMobileLayout(wrapper, canvas);
        return;
    }

    applyDesktopLayout(wrapper, canvas);
}

/**
 * Resets layout styles for mobile view
 */
function resetMobileLayout(wrapper, canvas) {
    wrapper.style.width = '';
    wrapper.style.height = '';
    canvas.style.transform = '';

    document.documentElement.style.removeProperty(CSS_VARS.HEADER_HEIGHT);
    document.documentElement.style.removeProperty(CSS_VARS.HEADER_FONT_SIZE);
    document.documentElement.style.removeProperty(CSS_VARS.FOOTER_HEIGHT);
    document.documentElement.style.removeProperty(CSS_VARS.FOOTER_FONT_SIZE);
}

/**
 * Applies scaled layout for desktop view
 */
function applyDesktopLayout(wrapper, canvas) {
    const availableWidth = window.innerWidth - LAYOUT.DESKTOP_PADDING;
    const availableHeight = window.innerHeight - LAYOUT.DESKTOP_PADDING;
    const totalBaseHeight = LAYOUT.BASE_HEIGHT + LAYOUT.BASE_FOOTER_HEIGHT;
    const scale = Math.min(
        1,
        availableWidth / LAYOUT.BASE_WIDTH,
        availableHeight / totalBaseHeight
    );

    wrapper.style.width = `${LAYOUT.BASE_WIDTH * scale}px`;
    wrapper.style.height = `${LAYOUT.BASE_HEIGHT * scale}px`;
    canvas.style.transform = `scale(${scale})`;

    document.documentElement.style.setProperty(
        CSS_VARS.HEADER_HEIGHT,
        `${LAYOUT.BASE_HEADER_HEIGHT * scale}px`
    );
    document.documentElement.style.setProperty(
        CSS_VARS.HEADER_FONT_SIZE,
        `${LAYOUT.BASE_HEADER_FONT * scale}px`
    );
    document.documentElement.style.setProperty(
        CSS_VARS.FOOTER_HEIGHT,
        `${LAYOUT.BASE_FOOTER_HEIGHT * scale}px`
    );
    document.documentElement.style.setProperty(
        CSS_VARS.FOOTER_FONT_SIZE,
        `${LAYOUT.BASE_FOOTER_FONT * scale}px`
    );
}
