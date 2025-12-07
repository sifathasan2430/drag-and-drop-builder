
"use client";
import { useSortable } from "@dnd-kit/sortable";
export default function Sortable({ id, children, data }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id,
    data,
  
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      className="bg-black"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}