import { usePageContext } from "./usePageContext";
import React from "react";

export { Link };

function Link(props: {
  href?: string;
  className?: string;
  onClick?: React.AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
  children: React.ReactNode;
}) {
  const pageContext = usePageContext();
  const className = [
    props.className,
    pageContext.urlPathname === props.href && "is-active",
  ]
    .filter(Boolean)
    .join(" ");
  return <a {...props} className={className} />;
}
