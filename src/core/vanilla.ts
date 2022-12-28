const createStoreImpl = (createState) => {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : state;

    if (!Object.is(nextState, state)) {
      const previousState = state;
      state =
        replace ?? typeof nextState !== "object"
          ? nextState
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const destroy = () => listeners.clear();

  const api = { setState, getState, subscribe, destroy };

  state = createState(setState, getState, api);

  return api;
};

const createStore = (createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl;

export default createStore;
