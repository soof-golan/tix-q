import { trpc } from "../utils/trpc";
import { useForm } from "react-hook-form";
import AppContext from "./AppContext";
import MarkdownCard from "./MarkdownCard";
import { useEffect } from "react";
import { markdownTips, markdownTipsTitle } from "../constants";
import type {
  RoomReadUniqueOutput,
  RoomUpdateInput,
} from "../types/roomsProcedures";

type WaitingRoomContentProps = {
  room: RoomReadUniqueOutput;
};

function WaitingRoomEditor_({ room }: WaitingRoomContentProps) {
  const utils = trpc.useContext();
  const id = room.id;
  const query = { id: room.id };
  const roomQuery = trpc.room.readUnique.useQuery(query, {
    initialData: room,
  });
  const { register, handleSubmit, watch, setValue, control } = useForm<
    Omit<RoomUpdateInput, "id">
  >({
    defaultValues: {
      markdown: roomQuery.data?.markdown || markdownTips,
      title: roomQuery.data?.title || markdownTipsTitle,
      closesAt: roomQuery.data?.closesAt,
      opensAt: roomQuery.data?.opensAt,
    },
  });

  const updateApi = trpc.room.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.room.readUnique.invalidate({ id: room.id }),
        await utils.room.readMany.invalidate(),
      ]);
    },
  });

  const publishApi = trpc.room.publish.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.room.readUnique.invalidate({ id: room.id }),
        await utils.room.readMany.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    setValue("markdown", roomQuery.data?.markdown || markdownTips);
    setValue("title", roomQuery.data?.title || markdownTipsTitle);
  }, [roomQuery.data?.markdown, roomQuery.data?.title, setValue]);

  const liveMarkdown = watch("markdown");
  const liveTitle = watch("title");
  return (
    <>
      <div className="my-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
        <form
          className="flex flex-col"
          onSubmit={handleSubmit((data) =>
            updateApi.mutate({
              id: room.id,
              markdown: data.markdown,
              title: data.title,
              opensAt: data.opensAt,
              closesAt: data.closesAt,
            })
          )}
        >
          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <h1 className="text-3xl font-medium leading-6 text-gray-900">
              Waiting Room Editor
            </h1>
          </div>
          <div className="items-center px-4 py-5 max-sm:flex-col sm:px-6">
            <p className="font-medium leading-6 text-gray-900">
              Edit the content of the waiting room here, once you are done click
              the save button below.
            </p>
            <p className="font-medium leading-6 text-gray-900">
              There's a live preview of the content in the card below, edit the
              content and see the changes in real time.
            </p>
            <p className="text-sm leading-6 text-gray-900">
              Psst... This editor is a bit janky, so you may want to use another
              editor and paste the content here after you are done. you can use{" "}
              <a
                className="text-blue-500 underline"
                href="https://stackedit.io/app#"
                target="_blank"
              >
                StackEdit
              </a>{" "}
              or{" "}
              <a
                className="text-blue-500 underline"
                href="https://dillinger.io/"
                target="_blank"
              >
                Dillinger
              </a>{" "}
              to edit the content.
            </p>
          </div>
          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <div className="flex flex-col justify-between py-5">
              <label className="py-5 text-2xl font-medium leading-6 text-gray-900">
                Title
              </label>
              <input
                className="rounded-md bg-gray-50 bg-opacity-50 px-4 py-5 text-lg font-medium leading-6 text-gray-900"
                {...register("title")}
              />
            </div>
            <button
              type="submit"
              className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <label className="text-2xl font-medium leading-6 text-gray-900">
              Content editor
            </label>
          </div>
          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <textarea {...register("markdown")} className="h-72 w-full" />
          </div>
          <div className="px-4 py-5 max-sm:flex-col sm:px-6">
            <p>Preview in the card below:</p>
            <p>This is how the content will look like after publishing.</p>
          </div>
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
