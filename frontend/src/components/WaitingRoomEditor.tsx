import { trpc } from "../utils/trpc";
import { useForm } from "react-hook-form";
import type { MarkdownEditInput } from "../types/MarkdownEditProcedure";
import AppContext from "./AppContext";
import MarkdownCard from "./MarkdownCard";
import { useEffect } from "react";
import { markdownTips, markdownTipsTitle } from "../constants";

type WaitingRoomContentProps = {
  id: string;
  markdown: string;
  title: string;
};

function WaitingRoomEditor_({ id, markdown, title }: WaitingRoomContentProps) {
  const utils = trpc.useContext();
  const room = trpc.markdown.read.useQuery(
    {
      id,
    },
    {
      networkMode: "offlineFirst",
      initialData: { markdown, title, id },
    }
  );
  const { register, handleSubmit, watch, setValue, control } =
    useForm<MarkdownEditInput>({
      defaultValues: {
        markdown: room.data?.markdown || markdownTips,
        title: room.data?.title || markdownTipsTitle,
      },
    });
  const contentEditApi = trpc.markdown.edit.useMutation({
    onSuccess: async () => {
      await utils.markdown.read.invalidate({ id });
    },
  });

  useEffect(() => {
    setValue("markdown", room.data?.markdown || markdownTips);
    setValue("title", room.data?.title || markdownTipsTitle);
  }, [room.data?.markdown, room.data?.title, setValue]);

  const liveMarkdown = watch("markdown");
  const liveTitle = watch("title");
  return (
    <>
      <div className="backdrop-blur-10 rounded-xl bg-white bg-opacity-25 p-4 py-2">
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
          />
          <label className="text-white">Content (Markdown)</label>
          <textarea {...register("markdown")} className="h-64 w-full" />
          <button
            className="rounded-md bg-indigo-500 p-2 text-white"
            type="submit"
          >
            Save
          </button>
        </form>
      </div>
      <MarkdownCard title={liveTitle} content={liveMarkdown} />
    </>
  );
}

export default function WaitingRoomEditor(props: WaitingRoomContentProps) {
  return (
    <AppContext>
      <WaitingRoomEditor_ {...props} />
    </AppContext>
  );
}
