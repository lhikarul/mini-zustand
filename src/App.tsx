import { useState } from "react";
import create from "./core/index";

const [useStore] = create((set) => ({
  books: {
    javascript: "javascript book",
    css: "css book",
  },
}));

function App() {
  const [title, setTitle] = useState("javascript");
  const book = useStore((state) => state.books[title], [title]);
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>{book}</div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button onClick={() => setTitle("css")}>change book</button>
    </div>
  );
}

export default App;
