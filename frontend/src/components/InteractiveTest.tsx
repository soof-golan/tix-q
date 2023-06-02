import TrpcContext from "./TrpcContext";
import {trpc} from "../utils/trpc";

function Test() {
  const register = trpc.register.useMutation()

  return <>
    <button onClick={() => register.mutate({
      idType: "PASSPORT",
      email: "test@email.com",
      idNumber: "1234567890",
      legalName: "Test User",
      phoneNumber: "+1234567890",
      waitingRoomId: "63cc36e6-acba-4591-9ee2-14909e358751",
    })} disabled={register.isLoading}>Register</button>
  </>
}

export default function Wrapper() {
  return <TrpcContext><Test/></TrpcContext>;

}
