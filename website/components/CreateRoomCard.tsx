import moment from "moment";
import { trpc } from "../utils/trpc";
import { useForm } from "react-hook-form";
import type { RoomCreateInput } from "../types/roomsProcedures";
import { markdownTips, markdownTipsTitle } from "../constants";

export default function CreateRoomCard() {
  const utils = trpc.useContext();
  const room = trpc.room.create.useMutation({
    networkMode: "offlineFirst",
    onSuccess: async () => {
      await utils.room.readMany.invalidate({});
    },
  });
  const { register, handleSubmit } = useForm<RoomCreateInput>({
    defaultValues: {
      title: markdownTipsTitle,
      markdown: markdownTips,
      opensAt: moment().add(1, "day").format("YYYY-MM-DDTHH:mm"),
      closesAt: moment().add(2, "day").format("YYYY-MM-DDTHH:mm"),
    },
  });

  return (
    <div className="my-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
      <form
        onSubmit={handleSubmit((data) => {
          room.mutate({
            title: data.title,
            markdown: data.markdown,
            opensAt: moment(data.opensAt).local().utc().toISOString(),
            closesAt: moment(data.closesAt).local().local().toISOString(),
            mobileImageBlob: null,
            desktopImageBlob: null,
          });
        })}
      >
        <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
          <h1 className="text-lg font-medium leading-6 text-gray-900">
            Create a new room
          </h1>
        </div>
        <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
          <input
            className="rounded-md bg-gray-50 bg-opacity-50 px-4 py-5 text-lg font-medium leading-6 text-gray-900 sm:px-6"
            {...register("title")}
          />
          <button
            type="submit"
            className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Create
          </button>
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
      </form>
    </div>
  );
}
