import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";

export function useDebounced<T>(value: T, delay: number): T {
  const isMounted = useIsMounted();
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isMounted.current) {
        setDebouncedValue(value);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, isMounted]);

  return debouncedValue;
}
