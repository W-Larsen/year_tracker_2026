import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ResizableBox - A wrapper component that enables resize and move functionality
 * 
 * Features:
 * - 4 corner resize handles (nw, ne, sw, se)
 * - Drag-to-move from any non-handle area
 * - Border highlights on hover
 * - Proportional scaling of children via CSS transform
 */
export function ResizableBox({
    children,
    blockId,
    layout,
    baseLayout,
    onResize,
    onMove,
    minWidth = 150,
    minHeight = 50,
    disabled = false
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeCorner, setResizeCorner] = useState(null);
    const [isHoveringCorner, setIsHoveringCorner] = useState(false);

    const boxRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
    const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 });

    // Calculate scale for proportional content scaling
    const scaleX = layout.width / baseLayout.width;
    const scaleY = layout.height / baseLayout.height;
    const scale = Math.min(scaleX, scaleY);

    // Handle resize start
    const handleResizeStart = useCallback((e, corner) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        setResizeCorner(corner);
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: layout.width,
            height: layout.height,
            left: layout.left,
            top: layout.top
        };
    }, [disabled, layout]);

    // Handle drag start
    const handleDragStart = useCallback((e) => {
        if (disabled || isResizing) return;

        // Only start drag from the box itself, not from children clicks
        if (e.target.closest('.resize-handle')) return;

        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            left: layout.left,
            top: layout.top
        };
    }, [disabled, isResizing, layout]);

    // Handle mouse move for both resize and drag
    useEffect(() => {
        if (!isDragging && !isResizing) return;

        const handleMouseMove = (e) => {
            if (isResizing && resizeCorner) {
                const deltaX = e.clientX - resizeStartRef.current.x;
                const deltaY = e.clientY - resizeStartRef.current.y;

                let newWidth = resizeStartRef.current.width;
                let newHeight = resizeStartRef.current.height;
                let newLeft = resizeStartRef.current.left;
                let newTop = resizeStartRef.current.top;

                // Calculate new dimensions based on corner
                if (resizeCorner.includes('e')) {
                    newWidth = Math.max(minWidth, resizeStartRef.current.width + deltaX);
                }
                if (resizeCorner.includes('w')) {
                    const widthDelta = Math.min(deltaX, resizeStartRef.current.width - minWidth);
                    newWidth = resizeStartRef.current.width - widthDelta;
                    newLeft = resizeStartRef.current.left + widthDelta;
                }
                if (resizeCorner.includes('s')) {
                    newHeight = Math.max(minHeight, resizeStartRef.current.height + deltaY);
                }
                if (resizeCorner.includes('n')) {
                    const heightDelta = Math.min(deltaY, resizeStartRef.current.height - minHeight);
                    newHeight = resizeStartRef.current.height - heightDelta;
                    newTop = resizeStartRef.current.top + heightDelta;
                }

                onResize(blockId, {
                    left: newLeft,
                    top: newTop,
                    width: newWidth,
                    height: newHeight
                });
            } else if (isDragging) {
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;
                onMove(blockId, deltaX, deltaY);

                // Update start position for continuous movement
                dragStartRef.current.x = e.clientX;
                dragStartRef.current.y = e.clientY;
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
    }, [isDragging, isResizing, resizeCorner, blockId, onResize, onMove, minWidth, minHeight]);

    // Resize handle component
    const ResizeHandle = ({ corner }) => (
        <div
            className={`resize-handle resize-handle-${corner}`}
            onMouseDown={(e) => handleResizeStart(e, corner)}
            onMouseEnter={() => setIsHoveringCorner(true)}
            onMouseLeave={() => setIsHoveringCorner(false)}
        />
    );

    const boxClasses = [
        'resizable-box',
        isDragging && 'dragging',
        isResizing && 'resizing',
        isHoveringCorner && 'highlight-border',
        disabled && 'disabled'
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={boxRef}
            className={boxClasses}
            style={{
                position: 'absolute',
                left: `${layout.left}px`,
                top: `${layout.top}px`,
                width: `${layout.width}px`,
                height: `${layout.height}px`,
                cursor: isDragging ? 'grabbing' : (disabled ? 'default' : 'grab')
            }}
            onMouseDown={handleDragStart}
        >
            {/* Scaled content container */}
            <div
                className="resizable-content"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${baseLayout.width}px`,
                    height: `${baseLayout.height}px`
                }}
            >
                {children}
            </div>

            {/* Resize handles */}
            {!disabled && (
                <>
                    <ResizeHandle corner="nw" />
                    <ResizeHandle corner="ne" />
                    <ResizeHandle corner="sw" />
                    <ResizeHandle corner="se" />
                </>
            )}
        </div>
    );
}

ResizableBox.propTypes = {
    children: PropTypes.node.isRequired,
    blockId: PropTypes.string.isRequired,
    layout: PropTypes.shape({
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired,
    baseLayout: PropTypes.shape({
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired,
    onResize: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    minWidth: PropTypes.number,
    minHeight: PropTypes.number,
    disabled: PropTypes.bool
};
