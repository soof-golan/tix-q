import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type MarkdownProps = {
  content: string;
  title: string;
};

export default function MarkdownCard({ content, title }: MarkdownProps) {
  return (
    <div className="backdrop-blur-10 rounded-xl bg-white bg-opacity-25 p-4">
      <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
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
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold" dir="auto" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-bold" dir="auto" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-bold" dir="auto" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="text-base font-bold" dir="auto" />
          ),
          h5: ({ node, ...props }) => (
            <h5 {...props} className="text-sm font-bold" dir="auto" />
          ),
          img: ({ node, ...props }) => (
            <div className="flex justify-center">
              <img {...props} className="max-w-full" />
            </div>
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="text-base" dir="auto" />
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
        }}
      />
    </div>
  );
}
