import React, { useEffect } from "react";

export default function DisplayRes({ data }) {
  useEffect(() => {
    console.log(data); // Log the data whenever it changes
  }, [data]);

  return (
    <div className="flex flex-col gap-3 w-full justify-center items-center my-4">
      {data.length > 0
        ? data.map((obj, index) => (
            <div
              key={index}
              className="flex flex-col w-10/12 border border-gray-300 rounded-md p-3"
            >
              {Object.entries(obj).map(([key, value], subIndex) => (
                <div key={subIndex}>
                  <span className="font-bold">{key}:</span> {value}
                </div>
              ))}
            </div>
          ))
        : "No Results Found!"}
    </div>
  );
}
