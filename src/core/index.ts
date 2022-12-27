import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import shallowEqual from "./shallowEqual";

const forceUpdateReducer = (state: boolean) => !state;

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducer = (state, newState) => newState;

export default function create(createState) {
  const listeners = new Set();

  const setState = (partial) => {
    const partialState =
      typeof partial === "function" ? partial(state) : partial;
    if (partialState !== state) {
      state = Object.assign({}, state, partialState);
      listeners.forEach((listener) => listener());
    }
  };

  const getState = () => state;

  const subscribe = (listener, options) => {
    if (!("currentSlice" in options)) {
      options.currentSlice = (options.selector || getState)(state);
    }
    const listenerFn = () => {
      // Destructure in the listener to get current values. We rely on this
      // because options is mutated in useStore.
      const { selector = getState, equalityFn = Object.is } = options;
      // Selector or equality function could throw but we don't want to stop
      // the listener from being called.
      // https://github.com/react-spring/zustand/pull/37
      try {
        const newStateSlice = selector(state);
        if (!equalityFn(options.currentSlice, newStateSlice)) {
          listener((options.currentSlice = newStateSlice));
        }
      } catch (error) {
        options.subscribeError = error;
        listener();
      }
    };
    listeners.add(listenerFn);

    return () => void listeners.delete(listenerFn);
  };

  const destroy = () => {
    listeners.clear();
  };

  const useStore = (selector = getState, equalityFn = Object.is) => {
    if (Array.isArray(equalityFn)) {
      equalityFn = Object.is;
      console.warn(
        "Zustand: the 2nd arg for dependencies was deprecated in 1.0. Please remove it! See: https://github.com/react-spring/zustand#selecting-multiple-state-slices"
      );
    }
    const isInitial = useRef(true);
    const options = useRef(
      // isInitial prevents the selector from being called every render.
      isInitial.current && {
        selector,
        equalityFn,
        currentSlice: ((isInitial.current = false), selector(state)),
      }
    ).current;

    // Update state slice if selector has changed or subscriber errored.
    if (selector !== options.selector || options.subscribeError) {
      const newStateSlice = selector(state);
      if (!equalityFn(options.currentSlice, newStateSlice)) {
        options.currentSlice = newStateSlice;
      }
    }

    useIsoLayoutEffect(() => {
      options.selector = selector;
      options.equalityFn = equalityFn;
      options.subscribeError = undefined;
    });

    const forceUpdate = useReducer(forceUpdateReducer, false)[1];

    useIsoLayoutEffect(() => subscribe(forceUpdate, options), []);

    return options.currentSlice;
  };

  let api = { destroy, getState, setState, subscribe };
  let state = createState(setState, getState, api);

  return [useStore, api];
}

export { create };
