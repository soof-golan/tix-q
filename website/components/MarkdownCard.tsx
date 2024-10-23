import { useContainerQuery } from "react-container-query";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  content: string;
  title: string;
  mobileImageBlob?: string;
  desktopImageBlob?: string;
};

// NOTE: The query must be defined outside the component
// Otherwise, it will cause a re-render loop
const query = {
  isMobile: {
    maxWidth: 700,
  },
};

export default function MarkdownCard({
  content,
  title,
  desktopImageBlob,
  mobileImageBlob,
}: MarkdownProps) {
  const [params, containerRef] = useContainerQuery(query, {});
  const isMobile = params.isMobile;
  const imageUrl = isMobile ? mobileImageBlob : desktopImageBlob;

  return (
    <div
      className="max-w-3xl rounded-xl bg-white bg-opacity-25 p-4 backdrop-blur-10 transition-all duration-100 ease-in-out"
      ref={containerRef}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h2 className="my-4 text-center font-extrabold text-3xl sm:text-4xl">
        {title}
      </h2>
      <ReactMarkdown
        allowedElements={[
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "img",
          "p",
          "a",
          "ul",
          "ol",
          "li",
          "b",
          "i",
          "strong",
          "em",
        ]}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          /* eslint-disable @typescript-eslint/no-unused-vars */
          h1: ({ node, ...props }) => (
            <h1 {...props} className="my-1 font-bold text-2xl" dir="auto" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="my-1 font-bold text-xl" dir="auto" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="my-1 font-bold text-lg" dir="auto" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="my-1 font-bold text-base" dir="auto" />
          ),
          h5: ({ node, ...props }) => (
            <h5 {...props} className="my-1 font-bold text-sm" dir="auto" />
          ),
          img: ({ node, ...props }) => (
            <div className="flex justify-center">
              <img {...props} className="max-w-full" />
            </div>
          ),
          p: ({ node, children, ...props }) => (
            <>
              <p {...props} className="text-base" dir="auto" />
              <div {...props} dir="auto">
                {children}
              </div>
            </>
          ),
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-500 underline" dir="auto" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-inside list-disc" dir="auto" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-inside list-decimal" dir="auto" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="text-base" dir="auto" />
          ),
          b: ({ node, ...props }) => (
            <b {...props} className="font-bold" dir="auto" />
          ),
          i: ({ node, ...props }) => (
            <i {...props} className="italic" dir="auto" />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-bold" dir="auto" />
          ),
          em: ({ node, ...props }) => (
            <em {...props} className="italic" dir="auto" />
          ),
          /* eslint-enable @typescript-eslint/no-unused-vars */
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
