import { trpc } from "../utils/trpc";
import { useCookie } from "react-use";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerInputSchema } from "../types/RegisterProcedure";
import Countdown from "react-countdown";
import { TurnstileWrapper } from "./TurnstileWrapper";
import * as Form from "@radix-ui/react-form";
import AppContext from "./AppContext";

type WaitingRoomProps = {
  waitingRoomId: string;
  opensAt: Date;
  closesAt: Date;
};

function WaitingRoom_({ waitingRoomId, opensAt, closesAt }: WaitingRoomProps) {
  const [token, setToken] = useCookie("turnstile_token");
  const registerApi = trpc.register.useMutation({
    onSuccess: (data, variables, ctx) => {},
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors, isValid, isSubmitting },
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
  const formDisabledReason = !token
    ? "Waiting for Captcha..."
    : registerApi.isLoading
    ? "Registering..."
    : userTooEarly
    ? "Too early to register"
    : userTooLate
    ? "Too late to register"
    : isSubmitSuccessful
    ? "Registered!"
    : !isValid
    ? "Please fill out the form"
    : "Register";
  const acceptingInput =
    !registerApi.isLoading && !isSubmitSuccessful && !userTooLate;

  return (
    <>
      <div className="my-auto mt-2 flex h-full w-full rounded-xl bg-white bg-opacity-25 p-4">
        <Form.Root
          className="w-[300px] "
          onSubmit={handleSubmit(
            (data) => registerApi.mutate(data),
            (errors, event) => {
              console.log(errors, event);
            }
          )}
        >
          <Form.Field className="mb-[10px] grid" name="legalName">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                Legal Name
              </Form.Label>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="valueMissing"
              >
                Please enter your name
              </Form.Message>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="typeMismatch"
              >
                Please enter a name
              </Form.Message>
              <Form.Control asChild>
                <input
                  className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                  {...register("legalName", {})}
                  type="text"
                  placeholder={"Legal Name"}
                  required
                  disabled={!acceptingInput}
                />
              </Form.Control>
            </div>
          </Form.Field>
          <Form.Field className="mb-[10px] grid" name="email">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                Email
              </Form.Label>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="valueMissing"
              >
                Please enter your email
              </Form.Message>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="typeMismatch"
              >
                Please enter a valid email
              </Form.Message>
              <Form.Control asChild>
                <input
                  className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                  {...register("email", {})}
                  type="email"
                  placeholder={"Email"}
                  required
                  disabled={!acceptingInput}
                />
              </Form.Control>
            </div>
          </Form.Field>
          <Form.Field className="mb-[10px] grid" name="phoneNumber">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                Phone Number
              </Form.Label>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="valueMissing"
              >
                Please enter your phone number
              </Form.Message>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="typeMismatch"
              >
                Please enter a valid phone number
              </Form.Message>
              <Form.Control asChild>
                <input
                  className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                  {...register("phoneNumber", {})}
                  type="tel"
                  placeholder={"Phone Number"}
                  required
                  disabled={!acceptingInput}
                />
              </Form.Control>
            </div>
          </Form.Field>
          <Form.Field className="mb-[10px] grid" name="idType">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                ID Type
              </Form.Label>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="valueMissing"
              >
                Please select your ID type
              </Form.Message>
              <Form.Control asChild>
                <select
                  className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                  {...register("idType")}
                  required
                  disabled={!acceptingInput}
                >
                  <option disabled value="SelectIdType">
                    Select ID Type
                  </option>
                  <option value="ID_CARD">ID Card</option>
                  <option value="PASSPORT">Passport</option>
                </select>
              </Form.Control>
            </div>
          </Form.Field>
          <Form.Field className="mb-[10px] grid" name="idNumber">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                ID Number
              </Form.Label>
              <Form.Message
                className="text-[13px] text-white opacity-[0.8]"
                match="valueMissing"
              >
                Please enter your ID number
              </Form.Message>
              <Form.Control asChild>
                <input
                  className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                  {...register("idNumber", {})}
                  type="text"
                  placeholder={"ID Number"}
                  required
                  disabled={!acceptingInput}
                />
              </Form.Control>
            </div>
          </Form.Field>
          <Form.Submit asChild>
            <button
              className="mt-[10px] box-border inline-flex h-[35px] w-full items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none text-violet11 shadow-[0_2px_10px] shadow-blackA7 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none"
              disabled={formDisabled}
              aria-busy={registerApi.isLoading}
            >
              {userTooEarly
                ? "Too early to register"
                : userTooLate
                ? "Too late to register"
                : registerApi.isLoading
                ? "Registering..."
                : isSubmitSuccessful
                ? "Registered!"
                : "Register"}
            </button>
          </Form.Submit>
          <Countdown date={opensAt}>
            <TurnstileWrapper
              onLoad={() => setToken("")}
              onError={(error) => setToken("")}
              onVerify={(token) =>
                setToken(token, {
                  secure: import.meta.env.PROD,
                  sameSite: "strict",
                })
              }
            />
          </Countdown>
        </Form.Root>
        {registerApi.isSuccess && registerApi.data.id && (
          <>
            <p>Registered Successfully!</p>
            <p>Your registration ID is: {registerApi.data.id}</p>
            <a href={window.location.href}>Register another person</a>
          </>
        )}
      </div>
    </>
  );
}

/*
This is a small workaround to enable usage of trpc without having a root level context provider
*/
export default function WaitingRoomForm(props: WaitingRoomProps) {
  return (
    <AppContext>
      <WaitingRoom_ {...props} />
    </AppContext>
  );
}
