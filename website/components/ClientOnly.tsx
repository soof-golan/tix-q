import { lazy, Suspense, useEffect, useState } from "react";

// @ts-expect-error: trust https://vite-plugin-ssr.com/dynamic-import
// eslint-disable-next-line react/prop-types
export function ClientOnly({ load, fallback, props }) {
  const [Component, setComponent] = useState(() => fallback);

  useEffect(() => {
    setComponent(() => lazy(load));
  }, []);

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}
