import { lazy } from "react";
import { Suspense } from "react";
import type { CountdownProps } from "react-countdown";
const Countdown_ = lazy(() => import("react-countdown"));

export default function Countdown(props: CountdownProps) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Countdown_ autoStart {...props} />
    </Suspense>
  );
}
