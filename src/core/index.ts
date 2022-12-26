import React from "react";
import shallowEqual from "./shallowEqual";

export default function create(createState) {
  const listeners = new Set();

  const setState = (partialState) => {
    state = Object.assign(
      {},
      state,
      typeof partialState === "function" ? partialState(state) : partialState
    );
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const destroy = () => {
    listeners.clear();
    state = {};
  };

  function useStore(selector) {
    // Gets entire state if no selector was passed in
    const selectState = typeof selector === "function" ? selector : getState;
    // Using functional initial b/c selected itself could be a function
    const [stateSlice, setStateSlice] = React.useState(() =>
      selectState(state)
    );
    // Prevent useEffect from needing to run when values change by storing them in a ref object
    const refs = React.useRef({ stateSlice, selectState }).current;
    // Update refs when needed and only after view has been updated
    React.useEffect(() => {
      refs.stateSlice = stateSlice;
      refs.selectState = selectState;
    }, [stateSlice, selectState]);

    // Subscribe/unsubscribe to the store only on mount/unmount
    React.useEffect(() => {
      return subscribe(() => {
        // Get fresh selected state
        const selected = refs.selectState(state);
        if (!shallowEqual(refs.stateSlice, selected))
          // Refresh local slice, functional initial b/c selected itself could be a function
          setStateSlice(() => selected);
      });
    }, []);

    // Returning the selected state slice
    return stateSlice;
  }

  let state = createState(setState, getState);
  const api = { destroy, getState, setState, subscribe };
  const result: [typeof useStore, typeof api] = [useStore, api];

  return result;
}
