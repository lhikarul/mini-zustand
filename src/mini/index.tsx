import { useEffect, useRef, useState } from "react";

const useStore = create((set) => {
  return {
    count: 0,
    actions: {
      inc: () => set((state) => ({ count: state.count + 1 })),
      dec: () => set((state) => ({ count: state.count - 1 })),
    },
  };
});

export default function create(createState, dependencies) {
  let state = {
    listeners: [],
    current: createState((merge) => {
      if (typeof merge === "function") {
        merge = merge(state.current);
      }
      state.current = Object.assign({}, state.current, merge);

      state.listeners.forEach((listener) => listener(state.current));
    }),
  };

  return [
    function (selector) {
      let selected =
        typeof selector === "function"
          ? selector(state.current)
          : state.current;

      const [slice, set] = useState(selected);

      const sliceRef = useRef({});

      useEffect(() => {
        const fn = () => {
          let selected =
            typeof selector === "function"
              ? selector(state.current)
              : state.current;

          if (sliceRef.current !== selected && selected === Object(selected)) {
            selected = Object.entries(selected).reduce((acc, [key, value]) => {
              if (sliceRef.current[key] === undefined)
                sliceRef.current[key] = value;
              return sliceRef.current[key] !== value
                ? Object.assign({}, acc, { [key]: value })
                : acc;
            }, sliceRef.current);
          }

          if (sliceRef.current !== selected) {
            set(() => selected);
          }
        };
        state.listeners.push(fn);

        return () =>
          (state.listeners = state.listeners.filter((i) => i === fn));
      }, dependencies || [selector]);

      return slice;
    },
    {
      subscribe: (fn) => {
        state.listeners.push(fn);
        return () => (state.listeners = state.listeners.filter(i != fn));
      },
      getState: () => state.current,
      destroy: () => ((state.listeners = []), (state.current = {})),
    },
  ];
}

function App() {
  const counter = useStore((state) => state.count); // 0
  const { inc } = useStore((state) => state.actions);
  return (
    <div>
      <button onClick={inc}></button>
    </div>
  );
}
