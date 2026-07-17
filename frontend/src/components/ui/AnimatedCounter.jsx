import useAnimatedNumber from "../../hooks/useAnimatedNumber";

export default function AnimatedCounter({ value, decimals = 1, suffix = "", prefix = "", duration = 800 }) {
  const animated = useAnimatedNumber(Number(value) || 0, duration);

  return (
    <span className="tabular-nums">
      {prefix}
      {animated.toFixed(decimals)}
      {suffix}
    </span>
  );
}
