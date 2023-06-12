import { lazy } from "react";
import type { CountdownProps } from "react-countdown";
import { Suspense } from "react";
const Countdown_ = lazy(() => import("react-countdown"));

export default function Countdown(props: CountdownProps) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Countdown_ {...props} />
    </Suspense>
  );
}
