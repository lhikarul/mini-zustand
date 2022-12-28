import { useState } from "react";
// import create from "./core/index";
import create from "./core/react";

const useCountStore = create((set) => {
  console.log("set ", set);
  return {
    count: 0,
    actions: {
      inc: () => set((state) => ({ count: state.count + 1 })),
      dec: () => set((state) => ({ count: state.count - 1 })),
    },
  };
});

function App() {
  const count = useCountStore((state) => state.count);
  const { inc, dec } = useCountStore((state) => state.actions);
  return (
    <div>
      <div>{count}</div>
      <button onClick={inc}>inc</button>
      <button onClick={dec}>dec</button>
    </div>
  );
}

export default App;
