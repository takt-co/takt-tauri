import { useEffect, useRef } from "react";

export const useIsMounted = (): React.MutableRefObject<boolean> => {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
