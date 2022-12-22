import React from "react";

export default function create(fn) {
  let listeners = [];
  let state = {
    current: fn(
      // an argument passes to the create
      // equivalent to the set parameter of create
      (merge) => {
        if (typeof merge === "function") {
          merge = merge(state.current);
        }
        state.current = { ...state.current, ...merge };
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
        const ping = () => {
          let selected = selector ? selector(state.current) : state.current;
          if (slice !== selected) {
            set(() => selected);
          }
        };
        listeners.push(ping);
        return () => (listeners = listeners.filter((i) => i == ping));
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
