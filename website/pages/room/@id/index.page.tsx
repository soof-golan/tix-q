import { WaitingRoomPage } from "../../../components/WaitingRoomPage";
import { inferProps } from "../../../renderer/types";
import type { onBeforeRender } from "./index.page.server";

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
  eventChoices,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl px-2 lg:px-8">
      <WaitingRoomPage
        content={markdown}
        title={title}
        mobileImageBlob={mobileImageBlob}
        desktopImageBlob={desktopImageBlob}
        waitingRoomId={id}
        opensAt={opensAt}
        closesAt={closesAt}
        ownerEmail={ownerEmail}
        eventChoices={eventChoices}
      />
    </div>
  );
}
