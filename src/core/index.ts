import React, { useCallback, useLayoutEffect, useReducer, useRef } from "react";
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
    const stateSelector = typeof selector === "function" ? selector : getState;
    const selectState = useCallback(
      stateSelector,
      dependencies as ReadonlyArray<any>
    );
    const selectStateRef = useRef(selectState);
    let [stateSlice, dispatch] = useReducer(reducer, state, selectState);

    // Call new selector if it has changed
    if (selectState !== selectStateRef.current) stateSlice = selectState(state);

    // Store in ref to enable updating without rerunning subscribe/unsubscribe
    const stateSliceRef = useRef(stateSlice);

    // Update refs only after view has been updated
    useLayoutEffect(() => {
      selectStateRef.current = selectState;
      stateSliceRef.current = stateSlice;
    }, [selectState, stateSlice]);

    // Subscribe/unsubscribe to the store only on mount/unmount
    useLayoutEffect(() => {
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
