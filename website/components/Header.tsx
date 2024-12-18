import { Link } from "../renderer/Link";
import { usePageContext } from "../renderer/usePageContext";
import AuthButton from "./AuthButton";

const Header = () => {
  const { documentProps } = usePageContext().exports;
  return (
    <header className="mb-2 flex w-full items-center justify-between bg-black bg-opacity-50 p-4 shadow-sm backdrop-blur-lg max-md:flex-col">
      <Link href="/">
        <h1 className="font-bold text-2xl text-white">
          {documentProps?.title ?? "Waiting Room"}
        </h1>
      </Link>
      <nav className="space-x-1">
        <AuthButton />
        <Link href="/">
          <button className="rounded bg-purple-600 px-4 py-2 font-bold text-sm text-white hover:bg-purple-700">
            Home
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="rounded bg-purple-600 px-4 py-2 font-bold text-sm text-white hover:bg-purple-700">
            Dashboard
          </button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
