import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yearTracker_blockLayouts';

/**
 * Default block layouts matching current CSS positions
 */
const DEFAULT_LAYOUTS = {
    training: {
        name: { left: 326, top: 446, width: 428, height: 94 },
        box: { left: 188, top: 554, width: 705, height: 542 },
        text: { left: 188, top: 1096, width: 705 },
        updated: { left: 213, top: 1094 }
    },
    films: {
        name: { left: 981, top: 449, width: 428, height: 94 },
        box: { left: 943, top: 554, width: 494, height: 280 },
        text: { left: 943, top: 834, width: 494 },
        updated: { left: 968, top: 833 }
    },
    english: {
        name: { left: 1659, top: 446, width: 428, height: 94 },
        box: { left: 1492, top: 554, width: 705, height: 311 },
        text: { left: 1492, top: 864, width: 705 },
        updated: { left: 1523, top: 864 }
    },
    activities: {
        name: { left: 968, top: 869, width: 428, height: 94 },
        box: { left: 936, top: 984, width: 492, height: 112 },
        text: { left: 936, top: 1096, width: 492 },
        updated: { left: 971, top: 1094 },
        subtitle: { left: 1110, top: 935 }
    },
    books: {
        name: { left: 1502, top: 924, width: 230, height: 94 },
        box: { left: 1492, top: 1029, width: 264, height: 67 },
        text: { left: 1492, top: 1096, width: 264 },
        updated: { left: 1523, top: 1094 }
    },
    games: {
        name: { left: 1943, top: 924, width: 230, height: 94 },
        box: { left: 1933, top: 1029, width: 264, height: 67 },
        text: { left: 1933, top: 1096, width: 264 },
        updated: { left: 1957, top: 1094 }
    }
};

/**
 * Calculate element offsets relative to box position
 */
function calculateOffsets(layout) {
    const boxLeft = layout.box.left;
    const boxTop = layout.box.top;
    const boxHeight = layout.box.height;

    return {
        name: {
            leftOffset: layout.name.left - boxLeft,
            topOffset: layout.name.top - boxTop
        },
        text: {
            leftOffset: layout.text?.left ? layout.text.left - boxLeft : 0,
            topOffset: layout.text?.top ? layout.text.top - (boxTop + boxHeight) : 0
        },
        updated: {
            leftOffset: layout.updated?.left ? layout.updated.left - boxLeft : 25,
            topOffset: layout.updated?.top ? layout.updated.top - (boxTop + boxHeight) : -2
        },
        subtitle: layout.subtitle ? {
            leftOffset: layout.subtitle.left - boxLeft,
            topOffset: layout.subtitle.top - boxTop
        } : null
    };
}

/**
 * Custom hook to manage block layouts (positions and dimensions)
 * Persists to localStorage for now (DB migration planned)
 */
export function useBlockLayout() {
    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load layouts from localStorage:', e);
        }
        return DEFAULT_LAYOUTS;
    });

    // Save to localStorage whenever layouts change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
        } catch (e) {
            console.warn('Failed to save layouts to localStorage:', e);
        }
    }, [layouts]);

    /**
     * Update a block's box position and size
     * Also updates related elements (name, text, updated) to maintain relative positions
     */
    const updateBlockLayout = useCallback((blockId, newBox) => {
        setLayouts(prev => {
            const currentLayout = prev[blockId];
            if (!currentLayout) return prev;

            const offsets = calculateOffsets(currentLayout);
            const widthScale = newBox.width / currentLayout.box.width;
            const heightScale = newBox.height / currentLayout.box.height;
            const avgScale = (widthScale + heightScale) / 2;

            // Calculate new positions based on offsets
            const newLayout = {
                ...currentLayout,
                box: newBox,
                name: {
                    left: newBox.left + (offsets.name.leftOffset * widthScale),
                    top: newBox.top + (offsets.name.topOffset * heightScale),
                    width: currentLayout.name.width * widthScale,
                    height: currentLayout.name.height * avgScale
                },
                text: {
                    left: newBox.left + (offsets.text.leftOffset * widthScale),
                    top: (newBox.top + newBox.height) + offsets.text.topOffset,
                    width: newBox.width
                },
                updated: {
                    left: newBox.left + offsets.updated.leftOffset,
                    top: (newBox.top + newBox.height) + offsets.updated.topOffset
                }
            };

            if (offsets.subtitle) {
                newLayout.subtitle = {
                    left: newBox.left + (offsets.subtitle.leftOffset * widthScale),
                    top: newBox.top + (offsets.subtitle.topOffset * heightScale)
                };
            }

            return {
                ...prev,
                [blockId]: newLayout
            };
        });
    }, []);

    /**
     * Move an entire block by delta x/y
     */
    const moveBlock = useCallback((blockId, deltaX, deltaY) => {
        setLayouts(prev => {
            const currentLayout = prev[blockId];
            if (!currentLayout) return prev;

            const newLayout = {
                ...currentLayout,
                box: {
                    ...currentLayout.box,
                    left: currentLayout.box.left + deltaX,
                    top: currentLayout.box.top + deltaY
                },
                name: {
                    ...currentLayout.name,
                    left: currentLayout.name.left + deltaX,
                    top: currentLayout.name.top + deltaY
                },
                text: currentLayout.text ? {
                    ...currentLayout.text,
                    left: currentLayout.text.left + deltaX,
                    top: currentLayout.text.top + deltaY
                } : undefined,
                updated: currentLayout.updated ? {
                    ...currentLayout.updated,
                    left: currentLayout.updated.left + deltaX,
                    top: currentLayout.updated.top + deltaY
                } : undefined
            };

            if (currentLayout.subtitle) {
                newLayout.subtitle = {
                    left: currentLayout.subtitle.left + deltaX,
                    top: currentLayout.subtitle.top + deltaY
                };
            }

            return {
                ...prev,
                [blockId]: newLayout
            };
        });
    }, []);

    /**
     * Reset layouts to default
     */
    const resetLayouts = useCallback(() => {
        setLayouts(DEFAULT_LAYOUTS);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    /**
     * Get layout for a specific block
     */
    const getLayout = useCallback((blockId) => {
        return layouts[blockId] || DEFAULT_LAYOUTS[blockId];
    }, [layouts]);

    return {
        layouts,
        getLayout,
        updateBlockLayout,
        moveBlock,
        resetLayouts
    };
}

export { DEFAULT_LAYOUTS };
