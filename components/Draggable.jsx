"use client";
import { useDraggable } from "@dnd-kit/core";

export default function Draggable({ id, children, data,...props }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} {...props}>
      {children}
    </div>
  );
}
