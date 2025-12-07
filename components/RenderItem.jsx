"use client"
 export default function RenderItem({ item, id, ...props }) {
  switch (item.type) {
    case "input":
      return <h1 {...props} className=" text-black h-10 ">input</h1>;
    case "button":
      return (
        <button {...props} className="bg-blue-500 h-10 w-full text-black px-2 py-1 rounded">
          Button
        </button>
      );
    case "image":
      return (
        <div {...props}  className="w-full h-20 bg-gray-300 text-center pt-5 text-black font-bold">
          Image
        </div>
      );
        case "row":
      return (
       <div {...props} className="border p-2 mb-3  bg-white ">
                <h3 className="font-semibold text-black ">Row</h3>
              </div>
      );
       case "column":
      return (
    <div {...props} className=" border p-2 bg-black">
       <h4 className="font-medium text-sm mb-2">
                            Column
                          </h4>
      </div>
      );
    default:
      return null;
  }
}