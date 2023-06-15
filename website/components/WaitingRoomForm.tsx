import { trpc } from "../utils/trpc";
import * as reactUse from "react-use";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerInputSchema } from "../types/RegisterProcedure";
import Countdown from "./Countdown";
import { TurnstileWrapper } from "./TurnstileWrapper";
import moment from "moment/moment";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";

type WaitingRoomProps = {
  waitingRoomId: string;
  opensAt: Date;
  closesAt: Date;
};

const { useCookie } = reactUse;
type FormInput = Omit<RegisterInput, "waitingRoomId">;

export default function WaitingRoomForm({
  waitingRoomId,
  opensAt,
  closesAt,
}: WaitingRoomProps) {
  const [now, setNow] = useState(moment());
  const [token, setToken] = useCookie("turnstile_token");
  const registerApi = trpc.register.useMutation();

  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      waitingRoomId: waitingRoomId,
      // @ts-expect-error: Force the user to select an ID type
      idType: "SelectIdType",
    },
  });

  const userTooEarly = now.isBefore(moment(opensAt));
  const userTooLate = now.isAfter(moment(closesAt));
  const status = userTooEarly ? "early" : userTooLate ? "late" : "open";

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const submitDisabled =
    !token ||
    registerApi.isLoading ||
    status !== "open" ||
    isSubmitSuccessful ||
    isSubmitting;

  const acceptingInput =
    !registerApi.isLoading && !isSubmitSuccessful && status !== "late";

  return (
    <>
      <div className="mt-2 w-full overflow-hidden rounded-lg bg-white bg-opacity-80 shadow backdrop-blur-sm">
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
                    dir="auto"
                    className="selection:color-white bg-blackA5 shadow-blackA9 selection:bg-blackA9 box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    placeholder="Enter your name | נא להזין שם"
                    {...register("legalName", {
                      required: true,
                      minLength: 2,
                      maxLength: 255,
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
                    className="selection:color-white bg-blackA5 shadow-blackA9 selection:bg-blackA9 box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    type="email"
                    placeholder="Enter your email | נא להזין אימייל"
                    {...register("email", {
                      required: true,
                      disabled: !acceptingInput,
                      minLength: 2,
                    })}
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
                    className="selection:color-white bg-blackA5 shadow-blackA9 selection:bg-blackA9 box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] px-[10px]  text-[15px] leading-none shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("idNumber", {
                      required: true,
                      disabled: !acceptingInput,
                      minLength: 5,
                      maxLength: 255,
                    })}
                    type="text"
                    placeholder="Enter your ID number | נא להזין מספר זהות"
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
                    className="selection:color-white bg-blackA5 shadow-blackA9 selection:bg-blackA9 box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] px-[10px]  text-[15px] leading-none shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("idType", {
                      required: true,
                      disabled: !acceptingInput,
                    })}
                  >
                    <option
                      disabled
                      value="SelectIdType"
                      className="text-gray-500"
                    >
                      Select ID Type / נא לבחור מסמך מזהה
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
                  <p className="text-xs text-gray-400">
                    Examples: +18006543210, +972541234567, 0541234567
                  </p>
                </dd>
                <dd className="text-sm font-medium text-gray-500" dir="auto">
                  <label htmlFor="phoenNumber">מספר טלפון</label>
                  <p className="text-xs text-gray-400">
                    דוגמאות: 0541234567, 972541234567, 00972541234567
                  </p>
                </dd>
                <dt className="col-span-3 mt-1 text-sm text-gray-900 sm:mt-0">
                  <input
                    className="selection:color-white bg-blackA5 shadow-blackA9 selection:bg-blackA9 box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] px-[10px]  text-[15px] leading-none shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                    {...register("phoneNumber", {
                      required: true,
                      disabled: !acceptingInput,
                      minLength: 5,
                      maxLength: 255,
                    })}
                    type="tel"
                    placeholder="Enter your phone number | נא להזין מספר טלפון"
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
                    className="text-violet11 shadow-blackA7 hover:bg-mauve3 mt-[10px] box-border inline-flex h-[35px] w-full items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={submitDisabled}
                    aria-busy={registerApi.isLoading}
                  >
                    {userTooEarly ? (
                      "Too early to register"
                    ) : userTooLate ? (
                      "Too late to register"
                    ) : registerApi.isLoading ? (
                      <>
                        <Spinner />
                      </>
                    ) : isSubmitSuccessful ? (
                      "Registered!"
                    ) : !token ? (
                      <Spinner />
                    ) : (
                      "Register"
                    )}
                  </button>
                </dt>
                <dd className="col-span-3 items-center">
                  {registerApi.isSuccess && registerApi.data.id && (
                    <>
                      <p>Registered Successfully!</p>
                      <p>Your registration ID is: {registerApi.data.id}</p>
                      <a
                        className="text-blue-500 underline"
                        href={window.location.href}
                      >
                        Register another person
                      </a>
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="grid grid-cols-3 items-center bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="text-sm font-medium text-gray-500">
                  {status === "early" ? (
                    <>Registration opens in</>
                  ) : status === "open" ? (
                    <>Registration now open!</>
                  ) : (
                    <>Registration closed</>
                  )}
                </dd>
                <dd className="mt-1 text-center text-3xl text-gray-900 sm:mt-0">
                  <Countdown date={opensAt} className="">
                    <TurnstileWrapper
                      onLoad={() =>
                        setToken("", {
                          secure: import.meta.env.PROD,
                          sameSite: "strict",
                          domain: import.meta.env.PUBLIC_SERVER_URL,
                          expires: 0,
                        })
                      }
                      onError={() =>
                        setToken("", {
                          secure: import.meta.env.PROD,
                          sameSite: "strict",
                          domain: import.meta.env.PUBLIC_SERVER_URL,
                          expires: 0,
                        })
                      }
                      onVerify={(token) => {
                        setToken(token, {
                          secure: import.meta.env.PROD,
                          domain: import.meta.env.PUBLIC_SERVER_URL,
                          expires: moment().add(1, "day").toDate(),
                          path: "/",
                          sameSite: "strict",
                        });
                      }}
                    />
                  </Countdown>
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
              </div>
            </dl>
          </div>
        </form>
      </div>
    </>
  );
}
