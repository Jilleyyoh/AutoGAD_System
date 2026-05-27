import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DragScrollProps {
    children: React.ReactNode;
    className?: string;
}

export default function DragScroll({ children, className }: DragScrollProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [showScrollbar, setShowScrollbar] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const hideTimerRef = useRef<number | null>(null);

    const scheduleHide = () => {
        if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
        }
        hideTimerRef.current = window.setTimeout(() => {
            setShowScrollbar(false);
        }, 700);
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        if (!hasOverflow) return;

        const target = event.target as HTMLElement | null;
        if (target?.closest('a, button, input, textarea, select, option, label')) {
            return;
        }

        isDraggingRef.current = true;
        startXRef.current = event.clientX;
        scrollLeftRef.current = container.scrollLeft;
        container.setPointerCapture(event.pointerId);
        container.classList.add('cursor-grabbing');
        container.classList.add('is-dragging');
        setShowScrollbar(true);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container || !isDraggingRef.current) return;

        const deltaX = event.clientX - startXRef.current;
        container.scrollLeft = scrollLeftRef.current - deltaX;
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        isDraggingRef.current = false;
        container.releasePointerCapture(event.pointerId);
        container.classList.remove('cursor-grabbing');
        container.classList.remove('is-dragging');
        scheduleHide();
    };

    const onScroll = () => {
        setShowScrollbar(true);
        scheduleHide();
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateOverflow = () => {
            setHasOverflow(container.scrollWidth > container.clientWidth + 1);
        };

        updateOverflow();

        const resizeObserver = new ResizeObserver(updateOverflow);
        resizeObserver.observe(container);

        window.addEventListener('resize', updateOverflow);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateOverflow);
        };
    }, []);

    useEffect(() => () => {
        if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onScroll={onScroll}
            className={cn(
                'drag-scroll overflow-x-auto select-none',
                hasOverflow ? 'has-overflow' : 'no-overflow',
                showScrollbar ? 'is-active' : 'is-idle',
                className
            )}
        >
            {children}
        </div>
    );
}
