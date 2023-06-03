import TrpcContext from "./TrpcContext";
import {trpc} from "../utils/trpc";
import {useCookie} from "react-use";
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {RegisterInput, registerInputSchema} from "../types/RegisterProcedure";
import Countdown from "react-countdown";
import {TurnstileWrapper} from "./TurnstileWrapper";

type WaitingRoomProps = {
  waitingRoomId: string;
  opensAt: Date;
  closesAt: Date;
}

function WaitingRoom_({waitingRoomId, opensAt, closesAt}: WaitingRoomProps) {
  const [token, setToken] = useCookie("turnstile_token");
  const registerApi = trpc.register.useMutation({
    onSuccess: (data, variables, ctx) => {

    }
  });

  const {
    control,
    register,
    handleSubmit,
    formState: {isSubmitSuccessful, errors, isValid, isSubmitting},
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      waitingRoomId: waitingRoomId,
      // @ts-expect-error: Force the user to select an ID type
      idType: "SelectIdType",
    },
  });


  const userTooEarly = new Date() < opensAt;
  const userTooLate = new Date() > closesAt;


  const formDisabled =
    !token ||
    registerApi.isLoading ||
    userTooEarly ||
    userTooLate ||
    isSubmitSuccessful ||
    // !isValid ||
    isSubmitting;
  const formDisabledReason = !token ? "Waiting for Captcha..." :
    registerApi.isLoading ? "Registering..." :
      userTooEarly ? "Too early to register" :
        userTooLate ? "Too late to register" :
          isSubmitSuccessful ? "Registered!" :
            !isValid ? "Please fill out the form" :
              "Register";
  const acceptingInput = !registerApi.isLoading && !isSubmitSuccessful && !userTooLate;

  return <>
    <form onSubmit={handleSubmit((data => registerApi.mutate(data)), (errors, event) => {
      console.log(errors, event);
    })}>
      <p>
        <label htmlFor="legalName">Legal Name</label>
        <input {...register("legalName", {})} type="text" placeholder={"Legal Name"} required
               disabled={!acceptingInput}
        />
      </p>
      <p>
        <label htmlFor="email">Email</label>
        <input {...register("email", {})} type="email" placeholder={"Email"} required disabled={!acceptingInput}/>
      </p>
      <p>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input {...register("phoneNumber", {})} required type="tel" disabled={!acceptingInput}/>
      </p>
      <p>
        <label htmlFor="idType">ID Type</label>
        <select {...register("idType")} required disabled={!acceptingInput}>
          <option disabled value="SelectIdType">Select ID Type</option>
          <option value="ID_CARD">ID Card</option>
          <option value="PASSPORT">Passport</option>
        </select>
      </p>
      <p>
        <label htmlFor="idNumber">ID Number</label>
        <input {...register("idNumber", {})} type="text" required disabled={!acceptingInput}/>
      </p>
      <input {...register("waitingRoomId", {})} hidden type="text" value={waitingRoomId}/>
      <Countdown date={opensAt}>
        <div>
          <button
            disabled={formDisabled}
            aria-busy={registerApi.isLoading}
          >
            {
              userTooEarly ? "Too early to register" :
                userTooLate ? "Too late to register" :
                  registerApi.isLoading ? "Registering..." :
                    isSubmitSuccessful ? "Registered!" :
                      "Register"
            }
          </button>

          <TurnstileWrapper
            onLoad={() => setToken("")}
            onError={(error) => setToken("")}
            onVerify={(token) =>
              setToken(token, {
                secure: import.meta.env.PROD,
                sameSite: "strict",
              })}
          />
          {formDisabledReason}
        </div>
      </Countdown>
    </form>
    {
      registerApi.isSuccess && registerApi.data.id && <>
        <p>Registered Successfully!</p>
        <p>Your registration ID is: {registerApi.data.id}</p>
        <p>Please {' '}
          <a href={window.location.href}>
            refresh
          </a>
          {' '} the page to make another submission</p>

      </>
    }
  </>
}


/*
This is a small workaround to enable usage of trpc without having a root level context provider
*/
export default function WaitingRoom(props: WaitingRoomProps) {
  return <TrpcContext>
    <WaitingRoom_{...props} />
  </TrpcContext>;
}
