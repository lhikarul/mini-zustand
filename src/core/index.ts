import React, { useLayoutEffect, useReducer, useRef } from "react";
import shallowEqual from "./shallowEqual";

const reducer = (state, newState) => newState;

export default function create(createState) {
  const listeners = new Set();

  const setState = (partial) => {
    const partialState =
      typeof partial === "function" ? partial(state) : partial;
    if (partialState !== state) {
      state = Object.assign({}, state, partialState);
      listeners.forEach((listener) => listener(state));
    }
  };

  const getState = () => state;

  const subscribe = (selectorOrListener, listenerOrUndef) => {
    let listener = selectorOrListener;

    if (listenerOrUndef) {
      const selector = selectorOrListener;
      let stateSlice = selector(state);
      listener = () => {
        const selectedSlice = selector(state);
        if (!shallowEqual(stateSlice, (stateSlice = selectedSlice)))
          listenerOrUndef(stateSlice);
      };
    }
    listeners.add(listener);
    return () => void listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  const useStore = (selector, dependencies) => {
    const selectorRef = useRef(selector);
    const depsRef = useRef(dependencies);
    let [stateSlice, dispatch] = useReducer(
      reducer,
      state,
      // Optional third argument but required to not be 'undefined'
      selector
    );

    // Need to manually get state slice if selector has changed with no deps or
    // deps exist and have changed
    if (
      selector &&
      ((!dependencies && selector !== selectorRef.current) ||
        (dependencies && !shallowEqual(dependencies, depsRef.current)))
    ) {
      stateSlice = selector(state);
    }

    // Update refs synchronously after view has been updated
    useLayoutEffect(() => {
      selectorRef.current = selector;
      depsRef.current = dependencies;
    }, dependencies || [selector]);

    useLayoutEffect(() => {
      return selector
        ? subscribe(
            // Truthy check because it might be possible to set selectorRef to
            // undefined and call this subscriber before it resubscribes
            () => (selectorRef.current ? selectorRef.current(state) : state),
            dispatch
          )
        : subscribe(dispatch);
      // Only resubscribe to the store when changing selector from function to
      // undefined or undefined to function
    }, [!selector]);

    return stateSlice;
  };

  let state = createState(setState, getState);

  return [useStore, { destroy, getState, setState, subscribe }];
}
