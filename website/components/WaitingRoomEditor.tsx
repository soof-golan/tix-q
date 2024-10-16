import { trpc } from "../utils/trpc";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { markdownTips, markdownTipsTitle } from "../constants";
import type { RoomUpdateInput } from "../types/roomsProcedures";
import moment, { Moment } from "moment";
import Spinner from "./Spinner";
import { useQuery } from "@tanstack/react-query";
import { Link } from "../renderer/Link";
import { WaitingRoomPage } from "./WaitingRoomPage";
import { eventChoiceSchema } from "../types/eventChoicesSchema";
import { useUser } from "reactfire";

type WaitingRoomContentProps = {
  id: string;
};

function roomIsClosed(closesAt: string | Moment): boolean {
  return moment().isAfter(closesAt);
}

function toDataUrl(file: File | null): Promise<string> {
  if (!file) {
    return Promise.resolve("");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) {
        return reject(new Error("failed to read file"));
      }
      resolve(reader.result.toString());
    };
    reader.onerror = reject;
    reader.onabort = reject;
    reader.readAsDataURL(file);
  });
}

export default function WaitingRoomEditor({ id }: WaitingRoomContentProps) {
  const user = useUser();
  const [smallImageUrl, setSmallImageUrl] = useState<string>("");
  const [largeImageUrl, setLargeImageUrl] = useState<string>("");
  const utils = trpc.useContext();
  const roomQuery = trpc.room.readUnique.useQuery(
    { id },
    {
      // @ts-expect-error: we don't fully define initialData
      initialData: {
        id: id,
        markdown: markdownTips,
        mobileImageBlob: "",
        desktopImageBlob: "",
        title: markdownTipsTitle,
        opensAt: moment().add(1, "day").utc().toISOString(),
        closesAt: moment().add(2, "day").utc().toISOString(),
        eventChoices: "",
      },
    }
  );

  const closesAt = moment(roomQuery.data?.closesAt)
    .utc(true)
    .local()
    .format("YYYY-MM-DDTHH:mm");
  const opensAt = moment(roomQuery.data?.opensAt)
    .utc(true)
    .local()
    .format("YYYY-MM-DDTHH:mm");
  const eventChoices = roomQuery.data?.eventChoices ?? "";
  const roomLiveQuery = useQuery<{
    urlReady: boolean;
  }>({
    enabled:
      !roomIsClosed(roomQuery?.data.closesAt) && !!roomQuery.data?.published,
    queryKey: ["roomLiveQuery", id],
    retry: true,
    retryDelay: 10000,
    initialData: { urlReady: false },
    queryFn: async () => {
      const roomUrl = `/room/${id}`;
      const response = await fetch(roomUrl);
      if (!response.ok) {
        throw new Error("Url not live yet");
      }
      return {
        urlReady: response.ok,
      };
    },
  });

  const { register, handleSubmit, watch, setValue } = useForm<
    Omit<RoomUpdateInput, "id" | "desktopImageBlob" | "mobileImageBlob"> & {
      mobileImagFile: FileList;
      desktopImagFile: FileList;
    }
  >({
    defaultValues: {
      markdown: roomQuery.data?.markdown || markdownTips,
      title: roomQuery.data?.title || markdownTipsTitle,
      closesAt: closesAt,
      opensAt: opensAt,
      eventChoices: "",
      // @ts-expect-error: typescript is wrong
      mobileImagFile: [],
      // @ts-expect-error: typescript is wrong
      desktopImagFile: [],
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
    setValue("opensAt", opensAt);
    setValue("closesAt", closesAt);
    setValue("eventChoices", eventChoices);
  }, [
    roomQuery.data?.markdown,
    roomQuery.data?.title,
    setValue,
    opensAt,
    closesAt,
    eventChoices,
  ]);

  const liveMarkdown = watch("markdown");
  const liveTitle = watch("title");
  const liveOpensAt = watch("opensAt");
  const liveClosesAt = watch("closesAt");
  const liveEventChoices = watch("eventChoices");
  const choicesPreview = eventChoiceSchema.safeParse(liveEventChoices);

  const dirty = [
    liveMarkdown !== roomQuery.data?.markdown,
    liveTitle !== roomQuery.data?.title,
    liveOpensAt !== opensAt,
    liveClosesAt !== closesAt,
    smallImageUrl !== roomQuery.data?.mobileImageBlob,
    largeImageUrl !== roomQuery.data?.desktopImageBlob,
    liveEventChoices !== roomQuery.data?.eventChoices,
  ].some(Boolean);

  const loading =
    roomQuery.isLoading || updateApi.isLoading || publishApi.isLoading;

  const acceptingInput =
    !!roomQuery.data?.published &&
    !updateApi.isLoading &&
    !publishApi.isLoading &&
    !roomQuery.isLoading;

  const deploymentInProgress =
    !roomLiveQuery.data?.urlReady &&
    roomQuery.data.published &&
    !roomIsClosed(closesAt);

  const smallImageFile = watch("mobileImagFile");
  const largeImageFile = watch("desktopImagFile");

  useEffect(() => {
    if (smallImageFile.length > 0) {
      toDataUrl(smallImageFile[0]).then(setSmallImageUrl);
    }
  }, [smallImageFile]);

  useEffect(() => {
    if (largeImageFile.length > 0) {
      toDataUrl(largeImageFile[0]).then(setLargeImageUrl);
    }
  }, [largeImageFile]);

  useEffect(() => {
    setLargeImageUrl(roomQuery.data?.desktopImageBlob || "");
  }, [roomQuery.data?.desktopImageBlob]);

  useEffect(() => {
    setSmallImageUrl(roomQuery.data?.mobileImageBlob || "");
  }, [roomQuery.data?.mobileImageBlob]);

  return (
    <>
      <div className="flex flex-col justify-center space-x-2 space-y-2 xl:flex-row xl:space-y-0">
        <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm xl:w-1/2">
          {roomQuery.data.published === false && (
            <form
              className="flex flex-col"
              onSubmit={handleSubmit(async (data) => {
                if (roomQuery?.data?.published) {
                  return;
                }
                const [mobileImageBlob, desktopImageBlob] = await Promise.all([
                  toDataUrl(data.mobileImagFile[0]).catch(() => {
                    alert("could not upload mobile image, please try again");
                    return null;
                  }),
                  toDataUrl(data.desktopImagFile[0]).catch(() => {
                    alert("could not upload desktop image, please try again");
                    return null;
                  }),
                ]);
                updateApi.mutate({
                  id: id,
                  markdown: data.markdown,
                  mobileImageBlob,
                  desktopImageBlob,
                  title: data.title,
                  opensAt: moment(data.opensAt).local().utc().toISOString(),
                  closesAt: moment(data.closesAt).local().utc().toISOString(),
                  eventChoices: data.eventChoices,
                });
              })}
            >
              <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
                <h1 className="text-3xl font-medium leading-6 text-gray-900">
                  Waiting Room Editor
                </h1>
              </div>
              <div className="items-center px-4 py-5 max-sm:flex-col sm:px-6">
                <p className="font-medium leading-6 text-gray-900">
                  Edit the content of the waiting room here, once you are done
                  click the save button below.
                </p>
                <p className="font-medium leading-6 text-gray-900">
                  There is a live preview of the content in the card below, edit
                  the content and see the changes in real time.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="items-center bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ">
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="mt-1 text-2xl text-gray-900 sm:col-span-2 sm:mt-0">
                      <input
                        className="w-full rounded bg-indigo-500 bg-opacity-20 px-4 py-2 "
                        {...register("title", {
                          disabled: acceptingInput,
                        })}
                        type="text"
                      />
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="items-center bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ">
                    <dt className="text-sm font-medium text-gray-500">
                      Mobile Background Image
                    </dt>
                    <dd className="mt-1 text-2xl text-gray-900 sm:col-span-2 sm:mt-0">
                      <input
                        className="w-full rounded bg-indigo-500 bg-opacity-20 px-4 py-2 "
                        {...register("mobileImagFile", {
                          disabled: acceptingInput,
                        })}
                        type="file"
                      />
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="items-center bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ">
                    <dt className="text-sm font-medium text-gray-500">
                      Desktop Background Image
                    </dt>
                    <dd className="mt-1 text-2xl text-gray-900 sm:col-span-2 sm:mt-0">
                      <input
                        className="w-full rounded bg-indigo-500 bg-opacity-20 px-4 py-2 "
                        {...register("desktopImagFile", {
                          disabled: acceptingInput,
                        })}
                        type="file"
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
                  Psst... This editor is a bit janky, so you may want to use
                  another editor and paste the content here after you are done.
                  you can use{" "}
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
                  {...register("markdown", {
                    disabled: acceptingInput,
                  })}
                  className="min-h-[500px] w-full"
                />
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Opens At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <input
                        {...register("opensAt", {
                          disabled: acceptingInput,
                        })}
                        type="datetime-local"
                      />
                    </dd>
                  </div>
                </dl>
                <dl>
                  <div className="bg-gray-50 bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Closes At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <input
                        {...register("closesAt", {
                          disabled: acceptingInput,
                        })}
                        type="datetime-local"
                      />
                    </dd>
                  </div>
                </dl>
                <dl>
                  <div className="bg-opacity-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="col-span-3 text-sm font-medium text-gray-500">
                      <h2 className="text-xl font-medium leading-6 text-gray-900">
                        Event Choices
                      </h2>
                      <p>Comma separated list (Leave empty to disable)</p>
                    </dt>
                    <dd className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                      <input
                        {...register("eventChoices", {
                          disabled: acceptingInput,
                        })}
                        className="w-full"
                        type="text"
                        placeholder="MidBurn 2020 / מידברן 2020, Burn In Motion / ברן אין מושן"
                      />
                    </dd>
                    <div className="col-span-3">
                      {choicesPreview.success ? (
                        <>
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Event Choice Preview:
                          </h3>
                          {!choicesPreview.data.length ? (
                            <p>No choices (Start typing to create some)</p>
                          ) : (
                            <ul
                              className="w-full list-inside justify-start justify-items-start"
                              dir="auto"
                            >
                              {choicesPreview.data.split(",").map((choice) => (
                                <li
                                  key={choice}
                                  dir="auto"
                                  className="list-item w-full"
                                >
                                  {choice}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <p>{choicesPreview.error.message}</p>
                      )}
                    </div>
                  </div>
                </dl>
              </div>
              <div className="flex items-center justify-between bg-gray-50 bg-opacity-50 px-4 py-5 max-sm:flex-col sm:px-6">
                <button
                  disabled={
                    updateApi.isLoading ||
                    publishApi.isLoading ||
                    !dirty ||
                    roomQuery.data?.published
                  }
                  type="submit"
                  className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Spinner />
                  ) : roomQuery.data?.published ? (
                    <>Published (cannot be edited)</>
                  ) : dirty ? (
                    <>Save</>
                  ) : (
                    <>Saved</>
                  )}
                </button>
              </div>
            </form>
          )}
          <div className="flex justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <div>
              <p>Preview:</p>
            </div>
            <div>
              {roomLiveQuery.data.urlReady && (
                <Link href={`/room/${id}`}>
                  <button
                    className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                  >
                    Open Waiting Room
                  </button>
                </Link>
              )}
              {deploymentInProgress && (
                <>
                  <a
                    href={"https://github.com/soof-golan/tix-q/actions"}
                    target={"_blank"}
                    rel={"noreferrer"}
                  >
                    See deployment progress
                  </a>
                  <p>
                    (if this takes longer than 5 minutes, please contact us)
                  </p>
                </>
              )}
              <button
                type="button"
                disabled={roomQuery.data.published || dirty}
                onClick={() => {
                  publishApi.mutate({ id });
                }}
                className="mr-2 mt-2 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Spinner />
                ) : deploymentInProgress ? (
                  <>
                    <p>
                      Deployment in progress <Spinner />
                    </p>
                  </>
                ) : roomQuery.data.published ? (
                  <>Room Public 🚀</>
                ) : dirty ? (
                  <>Save before publishing</>
                ) : (
                  <>Publish (cannot be undone)</>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-3xl xl:w-1/2">
          <WaitingRoomPage
            title={liveTitle}
            content={liveMarkdown}
            mobileImageBlob={smallImageUrl}
            desktopImageBlob={largeImageUrl}
            waitingRoomId={id}
            opensAt={liveOpensAt}
            closesAt={liveClosesAt}
            ownerEmail={user.data?.email ?? "not signed in"}
            eventChoices={liveEventChoices}
          />
        </div>
      </div>
    </>
  );
}
