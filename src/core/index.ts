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
      let selected = selector ? selector(state.current) : { ...state.current };

      const [slice, set] = React.useState(() => selected);

      const sliceRef = React.useRef();

      React.useEffect(() => {
        const ping = () => {
          // Get fresh selected state
          let selected = selector
            ? selector(state.current)
            : { ...state.current };
          // If state is not equal from the get go and not an atomic then shallow equal it
          if (
            sliceRef.current !== selected &&
            typeof selected === "object" &&
            !Array.isArray(selected)
          ) {
            selected = Object.entries(selected).reduce(
              (acc, [key, value]) =>
                sliceRef.current[key] !== value
                  ? { ...acc, [key]: value }
                  : acc,
              sliceRef.current
            );
          }
          // Using functional initial b/c selected itself could be a function
          if (sliceRef.current !== selected) {
            // Refresh local slice
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
