import moment from "moment";

const Footer = () => {
  return (
    <footer className="mt-2 flex w-full flex-row items-center justify-center bg-black bg-opacity-50 shadow-sm backdrop-blur-lg">
      <div className="flex w-full max-w-md flex-row items-center justify-between p-4 max-md:flex-col">
        <h1 className="text-2xl font-bold text-white">W8 Platforms</h1>
        <h2 className="text-lg text-white">
          {moment().year()} &copy; Soof Golan
        </h2>
      </div>
    </footer>
  );
};

export default Footer;
