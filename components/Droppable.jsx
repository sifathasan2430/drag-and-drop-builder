import { useDroppable } from "@dnd-kit/core";

export default function Droppable({ id, children, className, data ,...props}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });

  return (
    <div {...props}
      ref={setNodeRef}
      className={`${className}  ${isOver ? "bg-green-600" : ""}`}
    >
      {children}
    </div>
  );
}