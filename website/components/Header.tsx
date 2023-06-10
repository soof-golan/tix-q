import AuthButton from "./AuthButton";
import { Link } from "../renderer/Link";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="mb-2 flex w-full items-center justify-between bg-black bg-opacity-50 p-4 shadow-sm backdrop-blur-lg max-md:flex-col">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <nav className="space-x-1">
        <AuthButton />
        <Link
          href="/"
          className="rounded bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
};

export default Header;
