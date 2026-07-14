import { useCallback, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseLongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

export function useLongPress(
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void,
  onClick: (e: React.TouchEvent | React.MouseEvent) => void,
  { shouldPreventDefault = true, delay = 500 }: UseLongPressOptions = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);
  const isMobile = useIsMobile();

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onClick(event);
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => !isMobile && start(e),
    onMouseUp: (e: React.MouseEvent) => !isMobile && clear(e),
    onMouseLeave: (e: React.MouseEvent) => !isMobile && clear(e, false),
    onTouchStart: (e: React.TouchEvent) => isMobile && start(e),
    onTouchEnd: (e: React.TouchEvent) => isMobile && clear(e),
  };
}

const preventDefault = (e: Event) => {
  if (!("touches" in e)) return;
  if ((e as TouchEvent).touches.length < 2 && e.preventDefault) {
    e.preventDefault();
  }
};
