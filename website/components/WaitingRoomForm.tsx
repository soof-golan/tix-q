import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment/moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RegisterInput, registerInputSchema } from "../types/RegisterProcedure";
import { EventChoices } from "../types/eventChoicesSchema";
import { trpc } from "../utils/trpc";
import Countdown from "./Countdown";
import Spinner from "./Spinner";
import { useTurnstile } from "./TurnstileContext";
import { TurnstileWrapper } from "./TurnstileWrapper";

type WaitingRoomProps = {
  waitingRoomId: string;
  opensAt: Date;
  closesAt: Date;
  ownerEmail: string;
  eventChoices: EventChoices;
};

type FormInput = Omit<RegisterInput, "waitingRoomId">;

const noEventChoice = "";

export default function WaitingRoomForm({
  waitingRoomId,
  opensAt,
  closesAt,
  ownerEmail,
  eventChoices,
}: WaitingRoomProps) {
  const [now, setNow] = useState(moment());
  const [token] = useTurnstile();
  const registerApi = trpc.register.useMutation();
  const eventChoicesArr = eventChoices.trim().split(",");
  const showChoices = eventChoicesArr.length > 0;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      waitingRoomId: waitingRoomId,
      // @ts-expect-error: Force the user to select an ID type
      idType: "SelectIdType",
      eventChoice: "Please Select Event",
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
    registerApi.isSuccess ||
    isSubmitting;

  const acceptingInput =
    !registerApi.isLoading && !registerApi.isSuccess && status !== "late";

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
            <h1 className="font-medium text-gray-900 text-lg leading-6">
              Register
            </h1>
            <h1
              className="font-medium text-gray-900 text-lg leading-6"
              dir="auto"
            >
              הרשמה
            </h1>
          </div>
          <div className="border-gray-200 border-t">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  <label htmlFor="legalName">Legal Name</label>
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  <label htmlFor="legalName">שם מלא</label>
                </dd>
                <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                  <input
                    dir="auto"
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
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
                    <span className="flex justify-between text-red-500 text-sm">
                      <div>Please enter a name</div>
                      <div dir="auto">נא להזין שם</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-gray-200 border-t">
            <dl>
              <div className="grid grid-cols-2 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  <label htmlFor="email">Email</label>
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  <label htmlFor="email">אימייל</label>
                </dd>
                <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
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
                    <span className="flex justify-between text-red-500 text-sm">
                      <div>Please enter a valid email</div>
                      <div dir="auto">נא להזין אימייל תקין</div>
                    </span>
                  )}
                  {errors.email?.type === "required" && (
                    <span className="flex justify-between text-red-500 text-sm">
                      <div>Please enter a email</div>
                      <div dir="auto">נא להזין אימייל</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-gray-200 border-t">
            <dl>
              <div className="grid grid-cols-2 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  <label htmlFor="idType">ID Document Type</label>
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  <label htmlFor="idType">סוג מסמך מזהה</label>
                </dd>
                <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                  <select
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
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
                    <span className="flex justify-between text-red-500 text-sm">
                      <div>Please select an ID Document Type</div>
                      <div dir="auto">נא לבחור סוג מסמך מזהה</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-gray-200 border-t">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  <label>ID Number</label>
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  <label>מספר זהות</label>
                </dd>
                <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
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
                    <span className="flex justify-between text-red-500 text-sm">
                      <div>Please enter an ID number</div>
                      <div dir="auto">נא להזין מספר זהות</div>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          {!showChoices ? null : (
            <div className="border-gray-200 border-t">
              <dl>
                <div className="grid grid-cols-2 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                  <dd className="font-medium text-gray-500 text-sm">
                    <label htmlFor="eventChoice">Event Choice</label>
                  </dd>
                  <dd className="font-medium text-gray-500 text-sm" dir="auto">
                    <label htmlFor="eventChoice">בחירת אירוע</label>
                  </dd>
                  <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                    <select
                      className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
                      {...register("eventChoice", {
                        required: true,
                        disabled: !acceptingInput,
                      })}
                    >
                      <option
                        disabled
                        value={{
                          // @ts-expect-error: Force the user to select an event
                          noEventChoice,
                        }}
                        className="text-gray-500"
                      >
                        Please Select Event / נא לבחור אירוע
                      </option>
                      {eventChoicesArr.map((event) => (
                        <option key={event} value={event}>
                          {event}
                        </option>
                      ))}
                    </select>
                  </dt>
                  <dd className="col-span-3">
                    {errors.eventChoice && (
                      <span className="flex justify-between text-red-500 text-sm">
                        <div>Please Select Event</div>
                        <div dir="auto">נא לבחור אירוע</div>
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          <div className="border-gray-200 border-t">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  <label htmlFor="phoenNumber">Phone Number</label>
                  <p className="text-gray-400 text-xs">
                    Examples: +18006543210, +972541234567, 0541234567
                  </p>
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  <label htmlFor="phoenNumber">מספר טלפון</label>
                  <p className="text-gray-400 text-xs">
                    דוגמאות: 0541234567, 972541234567+, 00972541234567
                  </p>
                </dd>
                <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                  <input
                    className="selection:color-white box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
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
                      <span className="flex justify-between text-red-500 text-sm">
                        <div>Please enter valid phone number</div>
                        <div dir="auto">נא להזין מספר טלפון תקין</div>
                      </span>
                    ) : (
                      <span className="flex justify-between text-red-500 text-sm">
                        <div>Please enter phone number</div>
                        <div dir="auto">נא להזין מספר טלפון</div>
                      </span>
                    ))}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-gray-200 border-t">
            <dl>
              <div className="flex items-center justify-between bg-opacity-50 px-4 py-5 max-sm:flex-col max-sm:justify-center sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  {status === "early" ? (
                    <>Registration opens in</>
                  ) : status === "open" ? (
                    <>Registration now open!</>
                  ) : (
                    <>Registration closed</>
                  )}
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  {status === "early" ? (
                    <>הרשמה תפתח בעוד</>
                  ) : status === "open" ? (
                    <>הרשמה פתוחה כעת!</>
                  ) : (
                    <>הרשמה סגורה</>
                  )}
                </dd>
              </div>
              <dd className="bg-opacity-50 pb-4 text-center text-3xl text-gray-900">
                <Countdown date={opensAt}>
                  <div className="flex w-full flex-row items-center justify-center">
                    <TurnstileWrapper />
                  </div>
                </Countdown>
              </dd>
            </dl>
          </div>
          <div className="border-gray-200 border-t">
            <dl>
              <div className="grid grid-cols-2 bg-gray-50 bg-opacity-50 px-4 py-5 sm:gap-4 sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">Register</dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  הרשמה
                </dd>
                <dt className="col-span-3 mt-1 text-gray-900 text-sm sm:mt-0">
                  <button
                    type="submit"
                    className="mt-[10px] box-border inline-flex h-[35px] w-full items-center justify-center rounded-[4px] bg-white px-[15px] font-medium text-violet11 leading-none shadow-[0_2px_10px] shadow-blackA7 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={submitDisabled}
                    aria-busy={registerApi.isLoading}
                  >
                    {userTooEarly ? (
                      `Registration opens ${moment(opensAt).fromNow()}`
                    ) : userTooLate ? (
                      `registration closed ${moment(closesAt).fromNow()}`
                    ) : registerApi.isLoading ? (
                      <>
                        <Spinner />
                      </>
                    ) : registerApi.isSuccess ? (
                      "Registered!"
                    ) : registerApi.isError ? (
                      "Something went wrong (try again?)"
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
                      <a
                        className="text-blue-500 underline"
                        href={window.location.href}
                      >
                        <p>Click here to register another person</p>
                      </a>
                      <p dir="auto">ההרשמה בוצעה בהצלחה!</p>
                      <a
                        dir="auto"
                        className="text-blue-500 underline"
                        href={window.location.href}
                      >
                        <p>לחצו כאן לביצוע הרשמה נוספת</p>
                      </a>
                      <p>Registration ID: </p>
                      <p className="font-mono">{registerApi.data.id}</p>
                      <p>({"you don't need to save this id"})</p>
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-gray-200 border-t pb-4">
            <dl>
              <div className="flex items-center justify-between px-4 py-5 max-sm:flex-col max-sm:justify-center sm:px-6">
                <dd className="font-medium text-gray-500 text-sm">
                  This form is managed by
                </dd>
                <dd className="font-medium text-gray-500 text-sm" dir="auto">
                  טופס זה מנוהל על ידי
                </dd>
              </div>
              <dd className="text-center font-medium text-gray-500 text-sm">
                {ownerEmail}
              </dd>
            </dl>
          </div>
        </form>
      </div>
    </>
  );
}
