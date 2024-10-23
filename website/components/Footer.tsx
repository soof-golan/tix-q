import moment from "moment";

const Github = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon-tabler mr-2 h-6 w-6 items-center justify-center fill-current text-white"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
  </svg>
);

const Footer = () => {
  return (
    <footer className="mt-2 flex w-full flex-row items-center justify-center bg-black bg-opacity-50 shadow-sm backdrop-blur-lg">
      <div className="3 grid w-full max-w-lg items-center p-4 text-center md:grid-cols-3">
        <h1 className="font-bold text-2xl text-white">W8 Platforms</h1>
        <h2 className="text-lg text-white">
          {moment().year()} &copy; Soof Golan
        </h2>
        <a
          href="https://github.com/soof-golan/tix-q"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center justify-center text-end text-white"
        >
          <span className="mr-2 font-bold text-blue-400 text-md underline">
            Source Code
          </span>
          <Github />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
