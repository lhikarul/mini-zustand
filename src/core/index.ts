import React, { useEffect, useReducer, useRef } from "react";
import shallowEqual from "./shallowEqual";

const reducer = (state, newState) => newState;

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

  function useStore(selector, dependencies) {
    // State selector gets entire state if no selector was passed in
    const selectState = typeof selector === "function" ? selector : getState;
    const selectStateRef = useRef(selectState);
    const dependenciesRef = useRef(dependencies);
    console.log("state ", state);
    let [stateSlice, dispatch] = useReducer(reducer, state, selectState);

    if (
      (!dependencies && selectState !== selectStateRef.current) ||
      !shallowEqual(dependencies, dependenciesRef.current)
    )
      stateSlice = selectState(state);

    // Store in ref to enable updating without rerunning subscribe/unsubscribe
    const stateSliceRef = useRef(stateSlice);

    // Update refs only after view has been updated
    useEffect(() => void (selectStateRef.current = selectState), [selectState]);
    useEffect(() => void (stateSliceRef.current = stateSlice), [stateSlice]);

    // Subscribe/unsubscribe to the store only on mount/unmount
    useEffect(() => {
      return subscribe(() => {
        // Use the last selector passed to useStore to get current state slice
        const selectedSlice = selectStateRef.current(state);
        // Shallow compare previous state slice with current and rerender only if changed
        if (!shallowEqual(stateSliceRef.current, selectedSlice))
          dispatch(selectedSlice);
      });
    }, []);

    return stateSlice;
  }

  let state = createState(setState, getState);
  const api = { destroy, getState, setState, subscribe };

  return [useStore, api];
}
