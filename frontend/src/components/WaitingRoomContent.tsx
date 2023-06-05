import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { trpc } from "../utils/trpc";
import { useForm } from "react-hook-form";
import type { MarkdownEditInput } from "../types/MarkdownEditProcedure";
import AppContext from "./AppContext";

type WaitingRoomContentProps = {
  id: string;
  markdown: string;
  title: string;
};

function WaitingRoomContent_({ id, markdown, title }: WaitingRoomContentProps) {
  const contentEditApi = trpc.markdown.edit.useMutation({});
  const { register, handleSubmit, watch } = useForm<MarkdownEditInput>();
  const liveMarkdown = watch("markdown");
  const liveTitle = watch("title");
  return (
    <div className="backdrop-blur-10 rounded-xl bg-white bg-opacity-25 p-4">
      <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
        {liveTitle}
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
        ]}
        children={liveMarkdown}
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
            <img {...props} className="max-w-full" />
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
        }}
      />

      <form
        className="flex flex-col"
        onSubmit={handleSubmit((data) =>
          contentEditApi.mutate({
            id,
            markdown: data.markdown,
            title: data.title,
          })
        )}
      >
        <label className="text-white">Title</label>
        <input
          {...register("title")}
          className="rounded-md bg-white bg-opacity-25 p-2"
          defaultValue={title}
        />
        <label className="text-white">Content (Markdown)</label>
        <textarea
          {...register("markdown")}
          className="h-64 w-full"
          defaultValue={markdown}
        />
        <button
          className="rounded-md bg-indigo-500 p-2 text-white"
          type="submit"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export default function WaitingRoomContent(props: WaitingRoomContentProps) {
  return (
    <AppContext>
      <WaitingRoomContent_ {...props} />
    </AppContext>
  );
}
