import React from "react";

export default function create(fn) {
  let state = {
    listeners: [],
    current: fn(
      // set function
      (merge) => {
        // merge => state updater
        if (typeof merge === "function") {
          merge = merge(state.current);
        }
        state.current = Object.assign({}, state.current, merge);
        // state.current is for subscribe function
        state.listeners.forEach((listener) => listener(state.current));
      },
      () => state.current
    ),
  };

  return [
    // useStore
    (selector, dependencies) => {
      let selected = selector ? selector(state.current) : state.current;

      const [slice, set] = React.useState(() => selected);

      const sliceRef = React.useRef();

      React.useEffect(() => {
        const ping = () => {
          // Get fresh selected state
          let selected = selector ? selector(state.current) : state.current;
          // If state is not equal from the get go and not an atomic then shallow equal it
          if (sliceRef.current !== selected && selected === Object(selected)) {
            selected = Object.entries(selected).reduce(
              (acc, [key, value]) =>
                sliceRef.current[key] !== value
                  ? Object.assign({}, acc, { [key]: value })
                  : acc,
              sliceRef.current
            );
          }
          // Using functional initial b/c selected itself could be a function
          if (!shallowEqual(sliceRef.current, selected)) set(() => selected);
        };
        state.listeners.push(ping);
        return () =>
          (state.listeners = state.listeners.filter((i) => i == ping));
        // dependencies --> Memoizing selectors
      }, dependencies || [selector]);

      return selected;
    },
    {
      subscribe: (fn) => {
        state.listeners.push(fn);
        return () => (state.listeners = state.listeners.filter((i) => i != fn));
      },
      getState: () => state.current,
      destory: () => ((state.listeners = []), (state.current = {})),
    },
  ];
}

const hasOwn = Object.prototype.hasOwnProperty;
function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}
