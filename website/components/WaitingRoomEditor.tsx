import { trpc } from "../utils/trpc";
import { useForm } from "react-hook-form";
import MarkdownCard from "./MarkdownCard";
import { useEffect } from "react";
import { markdownTips, markdownTipsTitle } from "../constants";
import type { RoomUpdateInput } from "../types/roomsProcedures";
import moment from "moment";

type WaitingRoomContentProps = {
  id: string;
};

export default function WaitingRoomEditor({ id }: WaitingRoomContentProps) {
  const utils = trpc.useContext();
  const roomQuery = trpc.room.readUnique.useQuery(
    { id },
    {
      // @ts-expect-error: we don't fully define initialData
      initialData: {
        id: id,
        markdown: markdownTips,
        title: markdownTipsTitle,
        opensAt: moment().add(1, "day").toISOString(),
        closesAt: moment().add(2, "day").toISOString(),
      },
    }
  );
  const { register, handleSubmit, watch, setValue } = useForm<
    Omit<RoomUpdateInput, "id">
  >({
    defaultValues: {
      markdown: roomQuery.data?.markdown || markdownTips,
      title: roomQuery.data?.title || markdownTipsTitle,
      closesAt: moment(roomQuery.data?.closesAt).format("YYYY-MM-DDTHH:mm"),
      opensAt: moment(roomQuery.data?.opensAt).format("YYYY-MM-DDTHH:mm"),
    },
  });

  const updateApi = trpc.room.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.room.readUnique.invalidate({ id: id }),
        await utils.room.readMany.invalidate(),
      ]);
    },
  });

  const publishApi = trpc.room.publish.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.room.readUnique.invalidate({ id: id }),
        await utils.room.readMany.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    setValue("markdown", roomQuery.data?.markdown || markdownTips);
    setValue("title", roomQuery.data?.title || markdownTipsTitle);
    setValue(
      "opensAt",
      moment(roomQuery.data?.opensAt).format("YYYY-MM-DDTHH:mm")
    );
    setValue(
      "closesAt",
      moment(roomQuery.data?.closesAt).format("YYYY-MM-DDTHH:mm")
    );
  }, [
    roomQuery.data?.markdown,
    roomQuery.data?.title,
    setValue,
    roomQuery.data?.opensAt,
    roomQuery.data?.closesAt,
  ]);

  const liveMarkdown = watch("markdown");
  const liveTitle = watch("title");
  const dirty =
    liveMarkdown !== roomQuery.data?.markdown ||
    liveTitle !== roomQuery.data?.title ||
    watch("opensAt") !==
      moment(roomQuery.data?.opensAt).format("YYYY-MM-DDTHH:mm") ||
    watch("closesAt") !==
      moment(roomQuery.data?.closesAt).format("YYYY-MM-DDTHH:mm");
  return (
    <>
      <div className="my-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
        <form
          className="flex flex-col"
          onSubmit={handleSubmit((data) =>
            updateApi.mutate({
              id: id,
              markdown: data.markdown,
              title: data.title,
              opensAt: moment(data.opensAt).toISOString(),
              closesAt: moment(data.closesAt).toISOString(),
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
              There is a live preview of the content in the card below, edit the
              content and see the changes in real time.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="items-center bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ">
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-2xl text-gray-900 sm:col-span-2 sm:mt-0">
                  <input
                    className="w-full rounded bg-indigo-500 bg-opacity-20 px-4 py-2 "
                    {...register("title")}
                    type="text"
                  />
                </dd>
              </div>
            </dl>
          </div>
          <div className="items-center  px-4 py-5 max-sm:flex-col sm:px-6">
            <label className="text-2xl font-medium leading-6 text-gray-900">
              Content editor
            </label>
            <p className="text-sm leading-6 text-gray-900">
              Psst... This editor is a bit janky, so you may want to use another
              editor and paste the content here after you are done. you can use{" "}
              <a
                className="text-blue-500 underline"
                href="https://stackedit.io/app#"
                target="_blank"
                rel="noreferrer"
              >
                StackEdit
              </a>{" "}
              or{" "}
              <a
                className="text-blue-500 underline"
                href="https://dillinger.io/"
                target="_blank"
                rel="noreferrer"
              >
                Dillinger
              </a>{" "}
              to edit the content.
            </p>
          </div>

          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <textarea
              {...register("markdown")}
              className="min-h-[500px] w-full"
            />
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Opens At</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <input {...register("opensAt")} type="datetime-local" />
                </dd>
              </div>
            </dl>
            <dl>
              <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Closes At</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <input {...register("closesAt")} type="datetime-local" />
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <button
              disabled={updateApi.isLoading || publishApi.isLoading || !dirty}
              type="submit"
              className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dirty ? <>Save</> : <>Saved</>}
            </button>
          </div>
        </form>
        <div className="flex justify-between px-4 py-5 max-sm:flex-col sm:px-6">
          <div>
            <p>Preview in the card below:</p>
            <p>This is how the content will look like after publishing.</p>
          </div>
          <button
            type="button"
            // disabled={roomQuery.data.published || dirty}
            onClick={() => {
              publishApi.mutate({ id });
            }}
            className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {roomQuery.data.published ? (
              <>Room Public 🚀</>
            ) : dirty ? (
              <>Save before publishing</>
            ) : (
              <>Publish (cannot be undone)</>
            )}
          </button>
        </div>
      </div>

      <MarkdownCard title={liveTitle} content={liveMarkdown} />
    </>
  );
}
