import MarkdownCard from "../../../components/MarkdownCard";
import { inferProps } from "../../../renderer/types";
import type { onBeforeRender } from "./index.page.server";
import WaitingRoomForm from "../../../components/WaitingRoomForm";
import moment from "moment";

export { Page };

type Props = inferProps<typeof onBeforeRender>;

console.log(`👋 Hey There!
You're more than welcome to look around, but please don't write scripts that spam my servers.
If you're interested in the code, it's all open source and available here:
https://github.com/soof-golan/tix-q
    
This project is run voluntarily and I'm paying for it out of my own pocket.
See you around!
)'(

- Soof`);

function Page({
  id,
  markdown,
  title,
  opensAt,
  closesAt,
  ownerEmail,
  mobileImageBlob,
  desktopImageBlob,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl px-2 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <MarkdownCard
          content={markdown}
          title={title}
          mobileImageBlob={mobileImageBlob}
          desktopImageBlob={desktopImageBlob}
        />
        <WaitingRoomForm
          waitingRoomId={id}
          opensAt={moment(opensAt).toDate()}
          closesAt={moment(closesAt).toDate()}
          ownerEmail={ownerEmail}
        />
      </div>
    </div>
  );
}
