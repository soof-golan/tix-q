import { trpc } from "../utils/trpc";
import { useCookie } from "react-use";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerInputSchema } from "../types/RegisterProcedure";
import Countdown from "react-countdown";
import { TurnstileWrapper } from "./TurnstileWrapper";
import AppContext from "./AppContext";
import moment from "moment/moment";

type WaitingRoomProps = {
  waitingRoomId: string;
  opensAt: Date;
  closesAt: Date;
};

type FormInput = Omit<RegisterInput, "waitingRoomId">;

function WaitingRoom_({ waitingRoomId, opensAt, closesAt }: WaitingRoomProps) {
  const [token, setToken] = useCookie("turnstile_token");
  const registerApi = trpc.register.useMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors, isValid, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      waitingRoomId: waitingRoomId,
      // @ts-expect-error: Force the user to select an ID type
      idType: "SelectIdType",
    },
  });

  const userTooEarly = moment().isBefore(opensAt);
  const userTooLate = moment().isAfter(closesAt);
  const status = userTooEarly ? "early" : userTooLate ? "late" : "open";

  const submitDisabled =
    !token ||
    registerApi.isLoading ||
    userTooEarly ||
    userTooLate ||
    isSubmitSuccessful ||
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
      <div className="my-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
        <form
          onSubmit={handleSubmit((data) => {
            registerApi.mutate({
              waitingRoomId,
              ...data,
            });
          })}
        >
          <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col sm:px-6">
            <h1 className="text-lg font-medium leading-6 text-gray-900">
              Register
            </h1>
            <h1
              className="text-lg font-medium leading-6 text-gray-900"
              dir="auto"
            >
              הרשמה
            </h1>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  <label htmlFor="idType">Legal Name</label>
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  <label htmlFor="idType">שם מלא</label>
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("legalName", {
                      required: true,
                      minLength: 2,
                      disabled: !acceptingInput,
                    })}
                    type="text"
                  />
                </dt>
                <dd className="col-span-3">
                  {errors.legalName && (
                    <span className="flex justify-between text-sm text-red-500">
                      <div>Please enter a name</div>
                      <div dir="auto">נא להזין שם</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  <label htmlFor="email">Email</label>
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  <label htmlFor="email">אימייל</label>
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("email", {
                      required: true,
                      disabled: !acceptingInput,
                    })}
                    type="email"
                  />
                </dt>
                <dd className="col-span-3">
                  {errors.email?.type === "validate" && (
                    <span className="flex justify-between text-sm text-red-500">
                      <div>Please enter a valid email</div>
                      <div dir="auto">נא להזין אימייל תקין</div>
                    </span>
                  )}
                  {errors.email?.type === "required" && (
                    <span className="flex justify-between text-sm text-red-500">
                      <div>Please enter a email</div>
                      <div dir="auto">נא להזין אימייל</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  <label>ID Number</label>
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  <label>מספר זהות</label>
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none  shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("idNumber", {
                      required: true,
                      disabled: !acceptingInput,
                      minLength: 5,
                    })}
                    type="text"
                    autoComplete="off"
                  />
                </dt>
                <dd className="col-span-3">
                  {errors.idNumber && (
                    <span className="flex justify-between text-sm text-red-500">
                      <div>Please enter an ID number</div>
                      <div dir="auto">נא להזין מספר זהות</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  <label htmlFor="email">ID Document Type</label>
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  <label htmlFor="email">סוג מסמך מזהה</label>
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <select
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none  shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("idType", {
                      required: true,
                      disabled: !acceptingInput,
                    })}
                  >
                    <option disabled value="SelectIdType">
                      Select ID Type / סוג מסמך מזהה
                    </option>
                    <option value="ID_CARD">ID Card / תעודה מזהה</option>
                    <option value="PASSPORT">Passport / דרכון</option>
                  </select>
                </dt>
                <dd className="col-span-3">
                  {errors.idType && (
                    <span className="flex justify-between text-sm text-red-500">
                      <div>Please select an ID Document Type</div>
                      <div dir="auto">נא לבחור סוג מסמך מזהה</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  <label htmlFor="phoenNumber">Phone Number</label>
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  <label htmlFor="phoenNumber">מספר טלפון</label>
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none  shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("phoneNumber", {
                      required: true,
                      disabled: !acceptingInput,
                    })}
                    autoComplete="off"
                    type="tel"
                  />
                </dt>
                <dd className="col-span-3">
                  {errors.phoneNumber &&
                    (errors.phoneNumber?.type === "validate" ? (
                      <span className="flex justify-between text-sm text-red-500">
                        <div>Please enter valid phone number</div>
                        <div dir="auto">נא להזין מספר טלפון תקין</div>
                      </span>
                    ) : (
                      <span className="flex justify-between text-sm text-red-500">
                        <div>Please enter phone number</div>
                        <div dir="auto">נא להזין מספר טלפון</div>
                      </span>
                    ))}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">Register</dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  הרשמה
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <button
                    type="submit"
                    className="mt-[10px] box-border inline-flex h-[35px] w-full items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none text-violet11 shadow-[0_2px_10px] shadow-blackA7 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={submitDisabled}
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
                </dt>
                <dd className="col-span-3 items-center"></dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  {status === "early" ? (
                    <>Registration opens in</>
                  ) : status === "open" ? (
                    <>Registration now open!</>
                  ) : (
                    <>Registration closed</>
                  )}
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  {status === "early" ? (
                    <>הרשמה תפתח בעוד</>
                  ) : status === "open" ? (
                    <>הרשמה פתוחה כעת!</>
                  ) : (
                    <>הרשמה סגורה</>
                  )}
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <Countdown date={opensAt} className="">
                    <TurnstileWrapper
                      onLoad={() =>
                        setToken("", {
                          secure: import.meta.env.PROD,
                          sameSite: "strict",
                          expires: 0,
                        })
                      }
                      onError={(error) =>
                        setToken("", {
                          secure: import.meta.env.PROD,
                          sameSite: "strict",
                          expires: 0,
                        })
                      }
                      onVerify={(token) =>
                        setToken(token, {
                          secure: import.meta.env.PROD,
                          sameSite: "strict",
                        })
                      }
                    />
                  </Countdown>
                </dt>
              </div>
            </dl>
          </div>
        </form>
      </div>
      <div className="my-auto mt-2 flex h-full w-full rounded-xl bg-white bg-opacity-25 p-4">
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
