import { useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export const useDraggable = ({ disabled = false }: { disabled?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const moved = useRef(false);
  const dragThreshold = 5;

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    moved.current = false;
    const event = "touches" in e ? e.touches[0] : e;
    dragStart.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;

    const event = "touches" in e ? e.touches[0] : e;

    const newX = event.clientX - dragStart.current.x;
    const newY = event.clientY - dragStart.current.y;

    if (!moved.current) {
      const dx = Math.abs(newX - position.x);
      const dy = Math.abs(newY - position.y);
      if (dx > dragThreshold || dy > dragThreshold) {
        moved.current = true;
      }
    }

    setPosition({
      x: newX,
      y: newY,
    });
  };

  const onMouseUp = (e: MouseEvent | TouchEvent) => {
    setDragging(false);
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (moved.current) {
      // Prevent click event from firing on child elements
      const preventClick = (clickEvent: MouseEvent) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        ref.current?.removeEventListener("click", preventClick, true);
      };
      ref.current?.addEventListener("click", preventClick, true);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onMouseMove);
    window.addEventListener("touchend", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [dragging]);

  const draggableProps = {
    ref,
    onMouseDown,
    onTouchStart: onMouseDown,
    style: {
      "--x": `${position.x}px`,
      "--y": `${position.y}px`,
      // transform: `translate(${position.x}px, ${position.y}px)`,
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      transition: dragging ? "none" : "transform 0.1s ease-out",
      cursor: dragging ? "grabbing" : "grab",
    },
  };

  return disabled
    ? {
        ref,
        onMouseDown,
        onTouchStart: onMouseDown,
        style: {
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        },
      }
    : draggableProps;
};
