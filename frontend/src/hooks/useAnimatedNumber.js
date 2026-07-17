import { useState, useEffect, useRef } from "react";

export default function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  const prevRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null || isNaN(target)) return;

    const start = prevRef.current;
    const diff = target - start;
    if (Math.abs(diff) < 0.01) {
      setValue(target);
      prevRef.current = target;
      return;
    }

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}
