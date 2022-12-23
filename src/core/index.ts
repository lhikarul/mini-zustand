import React from "react";

export default function create(fn) {
  let listeners = [];
  let state = {
    current: fn(
      // set function
      (merge) => {
        // merge => state updater
        if (typeof merge === "function") {
          merge = merge(state.current);
        }
        state.current = { ...state.current, ...merge };
        // state.current is for subscribe function
        listeners.forEach((listener) => listener(state.current));
      },
      () => state.current
    ),
  };

  return [
    // useStore
    (selector, dependencies) => {
      let selected = selector ? selector(state.current) : state.current;

      const [slice, set] = React.useState(() => selected);
      React.useEffect(() => {
        console.log("rendered");
        const ping = () => {
          let selected = selector ? selector(state.current) : state.current;
          if (slice !== selected) {
            set(() => selected);
          }
        };
        listeners.push(ping);
        return () => (listeners = listeners.filter((i) => i == ping));
        // dependencies --> Memoizing selectors
      }, dependencies || [selector]);

      return selected;
    },
    {
      subscribe: (fn) => {
        listeners.push(fn);
        return () => (listeners = listeners.filter((i) => i != fn));
      },
      getState: () => state.current,
      destory: () => {
        listeners = [];
        state.current = [];
      },
    },
  ];
}
