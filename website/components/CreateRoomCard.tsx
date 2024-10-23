import moment from "moment";
import { useForm } from "react-hook-form";
import { markdownTips, markdownTipsTitle } from "../constants";
import type { RoomCreateInput } from "../types/roomsProcedures";
import { trpc } from "../utils/trpc";

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
            eventChoices: "",
          });
        })}
      >
        <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
          <h1 className="font-medium text-gray-900 text-lg leading-6">
            Create a new room
          </h1>
        </div>
        <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
          <input
            className="rounded-md bg-gray-50 bg-opacity-50 px-4 py-5 font-medium text-gray-900 text-lg leading-6 sm:px-6"
            {...register("title")}
          />
          <button
            type="submit"
            className="mt-2 mr-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
        <div className="border-gray-200 border-t">
          <dl>
            <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="font-medium text-gray-500 text-sm">Opens At</dt>
              <dd className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0">
                <input {...register("opensAt")} type="datetime-local" />
              </dd>
            </div>
          </dl>
          <dl>
            <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="font-medium text-gray-500 text-sm">Closes At</dt>
              <dd className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0">
                <input {...register("closesAt")} type="datetime-local" />
              </dd>
            </div>
          </dl>
        </div>
      </form>
    </div>
  );
}
