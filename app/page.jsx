"use client";
import { act, useState } from "react";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Draggable from "../components/Draggable";
import Droppable from "../components/Droppable";
import Sortable from "../components/Sortable";
import RenderItem from "../components/RenderItem";

const COMPONENTS = [
  { id: "input", type: "input" },
  { id: "button", type: "button" },
  { id: "image", type: "image" },
  { id: "row", type: "row" },
  { id: "column", type: "column" },
];

 




export default function App() {

  
  const touchSensor = useSensor(TouchSensor,{
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const mouseSensor=useSensor(MouseSensor,{
   
    activationConstraint: {
      distance: 10,
    },
  }
  )

  
  const sensors = useSensors(
    
    touchSensor,
    mouseSensor
 
  );


  const [layout, setLayout] = useState([
    {
      id: "row1",
      type: "row",
      children: [
        {
          id: "col1",
          type: "column",
          size: 33.33,
          children: [],
        },
        {
          id: "col2",
          type: "column",
          size: 33.33,
          children: [],
        },
        {
          id: "col3",
          type: "column",
          children: [],
          size: 33.33,
        },
      ],
    },
  ]);

  const handleDragEnd = (event) => {
    const { over, active } = event;

    if (!over) return;
    
 
    const insideRow =
      active.data.current?.from === "sidebar" &&
      over.id.startsWith("row-container-");

    const isNew = active.data.current?.from === "sidebar";

    const innerColumn =
      active.data.current?.from === "column" &&
      active.data.current?.node?.id &&
      over.id !== "trash";

    const canvasRowToTrash =
      active.data.current?.from === "canvas" &&
      active.data.current?.node?.type === "row" &&
      over.id === "trash";

    const canvasColumnToTrash =
      active.data.current?.from === "canvas" &&
      active.data.current?.node?.type === "column" &&
      over.id === "trash";

    if (insideRow) {
      if (active.data.current?.type === "column") {
        const newLayout = structuredClone(layout);
        const rowId = over.id.replace("row-container-", "");

        const row = newLayout.find((r) => r.id === rowId);

        row.children.push({
          id: "col" + Math.random().toString(36).substr(2, 5),
          type: "column",
          children: [],
          size: 33.33,
        });

        setLayout(newLayout);
      }
    }

    // insert item on column to other column
    if (innerColumn) {
      const newLayout = structuredClone(layout);
      const formId = active.data.current?.fromColumnId;
      const toId = over.id;
      const itemNodeId = active.data.current?.node?.id;

      if (formId === toId) return;

      const row = newLayout[0];

      const fromColumn = row.children.find((col) => col.id === formId);
      const toColumn = row.children.find((col) => col.id === toId);

      const itemIndex = fromColumn.children.findIndex(
        (item) => item.id === itemNodeId
      );
      const [removedItem] = fromColumn.children.splice(itemIndex, 1);

      toColumn.children.push(removedItem);

      // update state
      setLayout(newLayout);
    }

    const isColumnToColumn = active.id.startsWith("col") && over.id.startsWith("col");

    if (isColumnToColumn) {
        const row=active.data.current?.rowId;
       
      setLayout((prev) => {
        return moveColumn(prev, row, active.id, over.id);
      })
   

   

    }

   
 
   const isColumnToAnotherRow =    over.data.current?.rowId !== active.data.current?.rowId;
 if (isColumnToAnotherRow) {
 const fromIndex=over.data.current?.sortable?.index
   setLayout((prev) => {
     return moveColumnToAnotherRow(
       prev,
       active.data.current?.rowId,
       over.data.current?.rowId,
       active.id,
        fromIndex
     );
   });
 }
    if (isNew) {
      const isRow = active.data.current?.type === "row";

      if (isRow) {
        setLayout((prev) => [
          ...prev,
          {
            id: "row-" + Math.random().toString(36).substr(2, 5),
            type: "row",
            children: [],
          },
        ]);
        return;
      }
      setLayout((prev) => {
        return prev.map((row) => ({
          ...row,
          children: row.children.map((col) =>
            col.id === over.id
              ? {
                  ...col,
                  children: [
                    ...col.children,

                    {
                      id: "item-" + Math.random().toString(36).substr(2, 5),
                      type: active.data.current.type,
                    },
                  ],
                }
              : col
          ),
        }));
      });
    }

    // -------------------------------
    // Delete on trash drop
    // -------------------------------

    if (over.id === "trash") {
      setLayout((prev) => {
        return prev.map((row) => ({
          ...row,
          children: row.children.map((col) => ({
            ...col,
            children: col.children.filter((item) => item.id !== active.id),
          })),
        }));
      });
    }

    if (canvasRowToTrash) {
      setLayout((prev) => {
        return prev.filter((row) => row.id !== active.data.current?.node?.id);
      });
    }

    if (canvasColumnToTrash) {
      setLayout((prev) => {
        return prev.map((row) => ({
          ...row,
          children: row.children.filter(
            (col) => col.id !== active.data.current?.node?.id
          ),
        }));
      });
    }
  };

  const jsonString = JSON.stringify(layout);

  return (
    <DndContext sensors={sensors}  onDragEnd={handleDragEnd}>
      <div className="flex gap-5 p-5">
        {/* -------------------------------- Sidebar -------------------------------- */}
        <div className="w-1/3 border p-3 ">
          <h2 className="text-xl font-bold mb-3">Sidebar</h2>
          {COMPONENTS.map((item) => (
            <Draggable
              key={item.id}
              id={"sidebar-" + item.id}
              data={{ from: "sidebar", type: item.type }}
            >
              <div className="border p-2 mb-2 cursor-pointer bg-black text-white">
                {item.type}
              </div>
            </Draggable>
          ))}
        </div>

        {/* -------------------------------- Canvas -------------------------------- */}

        <div className="w-2/3 border bg-black text-white p-3 min-h-[300px]">
          <h2 className="text-xl font-bold mb-3">Canvas</h2>
          <Droppable id={"canvas"} className="min-h-screen">
            {layout &&
              layout.map((row) => (
                <Droppable key={row.id}  id={`row-container-${row.id}`}>
                  <Draggable
                    key={row.id}
                    id={row.id}
                    onClick={() => alert(`Clicked on row ${row.id}`)}
                    data={{
                      from: "canvas",
                      node: row,
                      formRowID: row.id,
                    }}
                  >
                    <div key={row.id} className="border p-2 mb-3  bg-gray-50">
                      <h3 className="font-semibold text-black">Row</h3>
                      <div className="flex gap-3 mt-2 ">
                        <SortableContext
                          items={row.children}
                          strategy={verticalListSortingStrategy}
                        >

                       
                          {row.children.map((col,index) => (
                      
            

             
                            <Draggable
                              key={col.id}
                              id={col.id}
                              onClick={() => alert(`Clicked on column ${col.id}`)}
                              data={{
                                from: "canvas",
                                node: col,
                                fromColumnID: col.id,
                                rowId: row.id,
                              }}
                            >
                              <Sortable
                                key={col.id}
                                id={col.id}
                                data={{ from: "container", rowId: row.id }}
                              >
                                <Droppable
                                  key={col.id}
                                  id={col.id}
                                 
                                  className="w-[200px] min-h-[200px]  border p-2 bg-black"
                                >
                                  <h4 className="font-medium text-sm mb-2">
                                    Column ({col.id})
                                  </h4>

                                  {col.children &&
                                    col.children.map((child) => (
                                      <Draggable
                                        key={child.id}
                                        id={child.id}
                                        data={{
                                          from: "column",
                                          node: child,
                                          fromColumnId: col.id,
                                          rowId: row.id,
                                        }}
                                      >
                                        <div className="border p-2 mb-2 bg-gray-100">
                                          <RenderItem
                                            item={child}
                                            id={child.id}
                                            onClick={() =>
                                              alert(`Clicked on ${child.type} and id ${child.id}`)
                                            }
                                          />
                                        </div>
                                      </Draggable>
                                    ))}
                                </Droppable>
                              </Sortable>
                            </Draggable>
           
                         
                          ))}
                        
                        </SortableContext>
                      </div>
                    </div>
                  </Draggable>
                </Droppable>
              ))}
          </Droppable>
        </div>

        {/* -------------------------------- Trash -------------------------------- */}

        <div className="w-1/3 flex flex-col gap-10">
          <Droppable
            id="trash"
            className="w-full border p-3 h-[200px] bg-red-100 text-center"
            onClick={() => alert("Trash")}
          >
            <h2 className="text-xl text-black font-bold">Trash</h2>
            <p className="text-black">Drop here to delete</p>
          </Droppable>
          <div className="text-2xl text-black">{jsonString}</div>
        </div>
      </div>
    </DndContext>
  );
}

function moveColumn(layout, rowId, fromColId, toColId) {
  // step 1 — copy layout
  const newLayout = structuredClone(layout);

  // step 2 — find the row
  const row = newLayout.find(r => r.id === rowId);
 
  if (!row) return newLayout;

  // step 3 — get indexes of from and to columns
  const fromIndex = row.children.findIndex(col => col.id === fromColId);
  const toIndex = row.children.findIndex(col => col.id === toColId);

  if (fromIndex === -1 || toIndex === -1) return newLayout;

  // step 4 — remove and insert
  const [removedCol] = row.children.splice(fromIndex, 1);
  console.log(removedCol,toIndex)
  row.children.splice(toIndex, 0, removedCol);

  return newLayout;
}

function moveColumnToAnotherRow(layout, fromRowId, toRowId, fromColId, toIndex) {
  const newLayout = structuredClone(layout);

  const fromRow = newLayout.find(r => r.id === fromRowId);
  const toRow   = newLayout.find(r => r.id === toRowId);

  if (!fromRow || !toRow) return newLayout;

  const fromIndex = fromRow.children.findIndex(c => c.id === fromColId);
  if (fromIndex === -1) return newLayout;

  // remove column from source row
  const [col] = fromRow.children.splice(fromIndex, 1);

  // insert column in target row
  toRow.children.splice(toIndex, 0, col);

  return newLayout;
}