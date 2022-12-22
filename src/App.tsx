import { useState } from "react";
import create from "./core/index";

const [useStore] = create((set) => ({
  result: "unfetch",
  fetch: async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    set({ result: json });
  },
}));

function App() {
  const { result, fetch } = useStore();

  return (
    <div>
      <div>{JSON.stringify(result)}</div>
      <div>
        <button
          onClick={() => fetch("https://jsonplaceholder.typicode.com/todos/1")}
        >
          fetch todo list
        </button>
      </div>
    </div>
  );
}

export default App;
