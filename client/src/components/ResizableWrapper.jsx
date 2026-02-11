import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Store the initial base sizes for each block (from original CSS)
const BASE_SIZES = {
    training: {
        name: { left: 326, top: 446, width: 428, height: 94, fontSize: 72 },
        box: { left: 188, top: 554, width: 705, height: 542, paddingTop: 18 },
        text: { left: 188, top: 1096, width: 705, fontSize: 20 },
        updated: { left: 213, top: 1094, fontSize: 12 }
    },
    films: {
        name: { left: 981, top: 449, width: 428, height: 94, fontSize: 72 },
        box: { left: 943, top: 554, width: 494, height: 280, paddingTop: 17 },
        text: { left: 943, top: 834, width: 494, fontSize: 20 },
        updated: { left: 968, top: 833, fontSize: 12 },
        hasInnerContent: true
    },
    english: {
        name: { left: 1659, top: 446, width: 428, height: 94, fontSize: 72 },
        box: { left: 1492, top: 554, width: 705, height: 311, paddingTop: 17 },
        text: { left: 1492, top: 864, width: 705, fontSize: 20 },
        updated: { left: 1523, top: 864, fontSize: 12 }
    },
    activities: {
        name: { left: 968, top: 869, width: 428, height: 94, fontSize: 72 },
        box: { left: 936, top: 984, width: 492, height: 112, paddingTop: 12 },
        text: { left: 936, top: 1096, width: 492, fontSize: 20 },
        updated: { left: 971, top: 1094, fontSize: 12 },
        subtitle: { left: 1110, top: 935, width: 340, fontSize: 18 }
    },
    books: {
        name: { left: 1502, top: 924, width: 230, height: 94, fontSize: 65 },
        box: { left: 1492, top: 1029, width: 264, height: 67, paddingTop: 12 },
        text: { left: 1492, top: 1096, width: 264, fontSize: 20 },
        updated: { left: 1523, top: 1094, fontSize: 12 }
    },
    games: {
        name: { left: 1943, top: 924, width: 230, height: 94, fontSize: 65 },
        box: { left: 1933, top: 1029, width: 264, height: 67, paddingTop: 12 },
        text: { left: 1933, top: 1096, width: 264, fontSize: 20 },
        updated: { left: 1957, top: 1094, fontSize: 12 }
    }
};

/**
 * ResizableWrapper - A simple overlay that adds resize and move handles to activity blocks
 */
export function ResizableWrapper({
    blockId,
    boxSelector,
    onLayoutChange,
    disabled = false
}) {
    const [isHovering, setIsHovering] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeCorner, setResizeCorner] = useState(null);
    // Track current scale (starts at 1)
    const [currentScale, setCurrentScale] = useState(1);

    const wrapperRef = useRef(null);
    const startRef = useRef({ x: 0, y: 0, startBox: null });

    // Get base sizes for this block
    const baseSizes = BASE_SIZES[blockId] || {};

    // Get the target box element
    const getBoxElement = useCallback(() => {
        return document.querySelector(boxSelector);
    }, [boxSelector]);

    // Sync wrapper position with target box
    const syncPosition = useCallback(() => {
        const box = getBoxElement();
        if (!box || !wrapperRef.current) return;

        const style = window.getComputedStyle(box);
        wrapperRef.current.style.left = style.left;
        wrapperRef.current.style.top = style.top;
        wrapperRef.current.style.width = style.width;
        wrapperRef.current.style.height = style.height;
    }, [getBoxElement]);

    // Initial sync
    useEffect(() => {
        syncPosition();
        const observer = new MutationObserver(syncPosition);
        const box = getBoxElement();
        if (box) {
            observer.observe(box, { attributes: true, attributeFilter: ['style'] });
        }
        window.addEventListener('resize', syncPosition);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncPosition);
        };
    }, [syncPosition, getBoxElement]);

    // Handle resize start
    const handleResizeStart = useCallback((e, corner) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();

        const boxEl = document.getElementById(`box-${blockId}`);
        if (!boxEl) return;

        const style = window.getComputedStyle(boxEl);
        startRef.current = {
            x: e.clientX,
            y: e.clientY,
            startBox: {
                left: parseFloat(style.left) || 0,
                top: parseFloat(style.top) || 0,
                width: parseFloat(style.width) || 0,
                height: parseFloat(style.height) || 0
            },
            startScale: currentScale
        };

        setIsResizing(true);
        setResizeCorner(corner);
    }, [disabled, blockId, currentScale]);

    // Handle drag start
    const handleDragStart = useCallback((e) => {
        if (disabled || isResizing) return;
        if (e.target.closest('.resize-handle')) return;

        e.preventDefault();

        // Get current positions of all elements
        const elements = ['name', 'box', 'text', 'updated', 'subtitle'];
        const positions = {};
        elements.forEach(key => {
            const el = document.getElementById(`${key}-${blockId}`);
            if (el) {
                const style = window.getComputedStyle(el);
                positions[key] = {
                    left: parseFloat(style.left) || 0,
                    top: parseFloat(style.top) || 0
                };
            }
        });

        startRef.current = {
            x: e.clientX,
            y: e.clientY,
            positions
        };

        setIsDragging(true);
    }, [disabled, isResizing, blockId]);

    // Handle mouse move
    useEffect(() => {
        if (!isDragging && !isResizing) return;

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startRef.current.x;
            const deltaY = e.clientY - startRef.current.y;

            if (isDragging) {
                const { positions } = startRef.current;
                // Move all elements by delta
                Object.entries(positions).forEach(([key, pos]) => {
                    const el = document.getElementById(`${key}-${blockId}`);
                    if (el) {
                        el.style.left = `${pos.left + deltaX}px`;
                        el.style.top = `${pos.top + deltaY}px`;
                    }
                });
                syncPosition();
            } else if (isResizing && resizeCorner) {
                const { startBox, startScale } = startRef.current;
                const baseBox = baseSizes.box;
                if (!startBox || !baseBox) return;

                let newWidth = startBox.width;
                let newHeight = startBox.height;
                let newLeft = startBox.left;
                let newTop = startBox.top;

                // Calculate new dimensions based on corner
                // Dynamic min size: 1/2 of base size (dots can't shrink more than 2x)
                const minWidth = baseBox.width * 0.5;
                const minHeight = baseBox.height * 0.5;

                if (resizeCorner.includes('e')) {
                    newWidth = Math.max(minWidth, startBox.width + deltaX);
                }
                if (resizeCorner.includes('w')) {
                    const widthChange = Math.min(deltaX, startBox.width - minWidth);
                    newWidth = startBox.width - widthChange;
                    newLeft = startBox.left + widthChange;
                }
                if (resizeCorner.includes('s')) {
                    newHeight = Math.max(minHeight, startBox.height + deltaY);
                }
                if (resizeCorner.includes('n')) {
                    const heightChange = Math.min(deltaY, startBox.height - minHeight);
                    newHeight = startBox.height - heightChange;
                    newTop = startBox.top + heightChange;
                }

                // Calculate scale relative to BASE size (not start size)
                const scaleX = newWidth / baseBox.width;
                const scaleY = newHeight / baseBox.height;
                const scale = Math.min(scaleX, scaleY);

                // Update box element
                const boxEl = document.getElementById(`box-${blockId}`);
                if (boxEl) {
                    boxEl.style.left = `${newLeft}px`;
                    boxEl.style.top = `${newTop}px`;
                    boxEl.style.width = `${newWidth}px`;
                    boxEl.style.height = `${newHeight}px`;

                    // Scale padding-top to prevent border overlapping circles
                    if (baseBox.paddingTop) {
                        boxEl.style.paddingTop = `${baseBox.paddingTop * scale}px`;
                    }

                    // For films block - scale the single films-inner wrapper
                    if (blockId === 'films') {
                        const filmsInner = boxEl.querySelector('.films-inner');
                        if (filmsInner) {
                            filmsInner.style.transform = `scale(${scale})`;
                            filmsInner.style.transformOrigin = 'top center';
                        }
                        // Cinema label is outside the wrapper - position relative to cinema-zone
                        const cinemaLabel = boxEl.querySelector('.cinema-label');
                        if (cinemaLabel) {
                            // Cinema-zone is 463px wide, centered in box via left:50% translateX(-50%)
                            // When scaled, cinema-zone visual right edge from box right = newWidth/2 - (463/2)*scale
                            // Original: right=10px at base box width 494px
                            // Cinema-zone right from box right in base: 494/2 - 231.5 = 15.5px
                            // Label extends 15.5 - 10 = 5.5px past cinema-zone right edge
                            // To maintain: right = newWidth/2 - 231.5*scale - 5.5*scale = newWidth/2 - 237*scale
                            cinemaLabel.style.top = `${108 * scale}px`;
                            cinemaLabel.style.right = `${newWidth / 2 - 237 * scale}px`;
                            cinemaLabel.style.fontSize = `${14 * scale}px`;
                        }
                    } else {
                        // Regular blocks - scale the grid container
                        const gridContainer = boxEl.querySelector('.grid-container');
                        if (gridContainer) {
                            gridContainer.style.transform = `scale(${scale})`;
                            gridContainer.style.transformOrigin = 'top center';
                        }
                    }
                }

                // Update name element using BASE sizes
                const baseName = baseSizes.name;
                const nameEl = document.getElementById(`name-${blockId}`);
                let nameBottomPos = newTop; // For subtitle positioning

                if (nameEl && baseName) {
                    const nameWidth = baseName.width * scale;
                    const nameHeight = baseName.height * scale;
                    const boxCenterX = newLeft + newWidth / 2;

                    // Gap between name bottom and box top (in base)
                    const baseGap = baseBox.top - (baseName.top + baseName.height);
                    const nameTop = newTop - nameHeight - baseGap * scale;
                    nameBottomPos = nameTop + nameHeight;

                    nameEl.style.left = `${boxCenterX - nameWidth / 2}px`;
                    nameEl.style.top = `${nameTop}px`;
                    nameEl.style.width = `${nameWidth}px`;
                    nameEl.style.height = `${nameHeight}px`;
                    nameEl.style.fontSize = `${baseName.fontSize * scale}px`;

                    // Scale padding-bottom for activities (has 20px padding for subtitle)
                    if (blockId === 'activities') {
                        nameEl.style.paddingBottom = `${20 * scale}px`;
                    }
                }

                // Update subtitle if exists (for activities block) - positioned INSIDE name box
                const baseSubtitle = baseSizes.subtitle;
                const subtitleEl = document.getElementById(`subtitle-${blockId}`);
                if (subtitleEl && baseSubtitle && baseName && nameEl) {
                    // Use the SAME left and width as the name element for proper centering
                    const nameRect = {
                        left: parseFloat(nameEl.style.left),
                        width: parseFloat(nameEl.style.width),
                        top: parseFloat(nameEl.style.top)
                    };

                    // Calculate vertical offset INSIDE the name box
                    // In base: subtitle.top (935) - name.top (869) = 66px from top of name
                    const baseOffsetInName = baseSubtitle.top - baseName.top;
                    const scaledOffset = baseOffsetInName * scale;

                    // Use same left and width as name - text-align: center will handle it
                    subtitleEl.style.left = `${nameRect.left}px`;
                    subtitleEl.style.width = `${nameRect.width}px`;
                    subtitleEl.style.top = `${nameRect.top + scaledOffset}px`;
                    subtitleEl.style.fontSize = `${baseSubtitle.fontSize * scale}px`;
                }

                // Update text element - positioned below the box
                const baseText = baseSizes.text;
                const textEl = document.getElementById(`text-${blockId}`);
                if (textEl && baseText) {
                    textEl.style.left = `${newLeft}px`;
                    textEl.style.top = `${newTop + newHeight}px`;
                    textEl.style.width = `${newWidth}px`;
                    textEl.style.fontSize = `${baseText.fontSize * scale}px`;
                }

                // Update updated label
                const baseUpdated = baseSizes.updated;
                const updatedEl = document.getElementById(`updated-${blockId}`);
                if (updatedEl && baseUpdated) {
                    updatedEl.style.left = `${newLeft + 25 * scale}px`;
                    updatedEl.style.top = `${newTop + newHeight - 2}px`;
                    updatedEl.style.fontSize = `${baseUpdated.fontSize * scale}px`;
                }

                syncPosition();
                setCurrentScale(scale);

                if (onLayoutChange) {
                    onLayoutChange(blockId, 'resize', {
                        left: newLeft,
                        top: newTop,
                        width: newWidth,
                        height: newHeight,
                        scale
                    });
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeCorner(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, resizeCorner, blockId, syncPosition, onLayoutChange, baseSizes]);

    const wrapperClasses = [
        'resize-wrapper',
        isHovering && 'hovering',
        isDragging && 'dragging',
        isResizing && 'resizing',
        disabled && 'disabled'
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={wrapperRef}
            className={wrapperClasses}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseDown={handleDragStart}
        >
            {!disabled && (
                <>
                    <div
                        className="resize-handle resize-handle-nw"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                    <div
                        className="resize-handle resize-handle-ne"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="resize-handle resize-handle-sw"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="resize-handle resize-handle-se"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                </>
            )}
        </div>
    );
}

ResizableWrapper.propTypes = {
    blockId: PropTypes.string.isRequired,
    boxSelector: PropTypes.string.isRequired,
    onLayoutChange: PropTypes.func,
    disabled: PropTypes.bool
};
