import MarkdownCard from "../../../components/MarkdownCard";
import { inferProps } from "../../../renderer/types";
import type { onBeforeRender } from "./index.page.server";
import WaitingRoomForm from "../../../components/WaitingRoomForm";
import moment from "moment";

export { Page };

type Props = inferProps<typeof onBeforeRender>;

function Page({ id, markdown, title, opensAt, closesAt }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <MarkdownCard content={markdown} title={title} />
        <WaitingRoomForm
          waitingRoomId={id}
          opensAt={moment(opensAt).toDate()}
          closesAt={moment(closesAt).toDate()}
        />
      </div>
    </div>
  );
}
