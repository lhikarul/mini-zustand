import { useState } from "react";
import create from "./core/index";

const [, api] = create((set) => ({
  name: "Evans",
  age: 18,
  actions: {
    setAge: () => set((state) => ({ age: state.age + 1 })),
  },
}));

window.api = api;

api.subscribe((state) =>
  console.log("i log whenever state changes", state.age)
);

const actions = api.getState().actions;

function App() {
  const [, setUpdate] = useState({});
  const handleSetAge = () => {
    actions.setAge();
    setUpdate({});
  };

  return <div onClick={handleSetAge}>{api.getState().age}</div>;
}

export default App;
