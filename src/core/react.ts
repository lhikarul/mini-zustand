import { useDebugValue, useSyncExternalStore } from "react";
import createStore from "./vanilla";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

export function useStore(api, selector, equalityFn) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}

const createImpl = (createState) => {
  const api =
    typeof createState === "function" ? createStore(createState) : createState;

  const useBoundStore = (selector, equalityFn) =>
    useStore(api, selector, equalityFn);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};

const create = (createState) =>
  createState ? createImpl(createState) : createImpl;

export default create;
