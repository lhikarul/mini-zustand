import create, { miniCreate } from "./core/index";

const [useStore] = miniCreate((set) => ({
  // Everything in here is your state
  count: 1,
  // You don't have to nest your actions, but makes it easier to fetch them later on
  actions: {
    inc: () => set((state) => ({ count: state.count + 1 })), // same semantics as setState
    dec: () => set((state) => ({ count: state.count - 1 })),
  },
}));

function Counter() {
  // Will only re-render the component when "count" changes
  const count = useStore((state) => state.count);

  return <h1>{count}</h1>;
}

function Controls() {
  // "actions" isn't special, we just named it like that to fetch updaters easier
  const { inc, dec } = useStore((state) => state.actions);
  return (
    <>
      <button onClick={inc}>up</button>
      <button onClick={dec}>down</button>
    </>
  );
}

function App() {
  return (
    <div>
      <Counter />
      <Controls />
    </div>
  );
}

export default App;
