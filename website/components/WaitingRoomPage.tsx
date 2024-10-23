import moment from "moment/moment";
import MarkdownCard from "./MarkdownCard";
import WaitingRoomForm from "./WaitingRoomForm";

export function WaitingRoomPage(props: {
  content: string;
  title: string;
  mobileImageBlob: string;
  desktopImageBlob: string;
  waitingRoomId: string;
  opensAt: string;
  closesAt: string;
  ownerEmail: string;
  eventChoices: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <MarkdownCard
        content={props.content}
        title={props.title}
        mobileImageBlob={props.mobileImageBlob}
        desktopImageBlob={props.desktopImageBlob}
      />
      <WaitingRoomForm
        waitingRoomId={props.waitingRoomId}
        opensAt={moment(props.opensAt).toDate()}
        closesAt={moment(props.closesAt).toDate()}
        ownerEmail={props.ownerEmail}
        eventChoices={props.eventChoices}
      />
    </div>
  );
}
