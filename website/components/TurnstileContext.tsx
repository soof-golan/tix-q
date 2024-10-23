import {
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

const Context = createContext<[string, (s: SetStateAction<string>) => void]>([
  "",
  () => {
    throw new Error("setToken was not initialized");
  },
]);

export function TurnstileContext({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string>("");

  return (
    <Context.Provider value={[token, setToken]}>{children}</Context.Provider>
  );
}

export function useTurnstile() {
  return useContext(Context);
}
