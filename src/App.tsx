import { useState } from "react";
import create from "./core/index";

const [useStore] = create((set) => ({
  count: 0,
  books: {
    javascript: "javascript book",
    css: "css book",
  },
  actions: {
    inc: () => set((state) => ({ count: state.count + 1 })),
  },
}));
function App() {
  const [title, setTitle] = useState("javascript");
  const book = useStore((state) => state.books[title]);
  // const count = useStore((state) => state.count);
  // const { inc } = useStore((state) => state.actions);
  const [count2, setCount] = useState(0);

  return (
    <div>
      <div>{book}</div>
      {/* <button onClick={inc}>useStore {count}</button> */}
      <button onClick={() => setCount(count2 + 1)}>useState {count2}</button>
      <button onClick={() => setTitle("css")}>change book</button>
    </div>
  );
}

export default App;
