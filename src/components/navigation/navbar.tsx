import Image from "next/image";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="mx-auto my-3 flex justify-between gap-5 align-middle md:w-full">
      <div className="my-auto h-fit w-fit flex-row rounded-xl border-2 border-black bg-button font-bold text-black hover:bg-buttonHover sm:w-36 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex items-center text-right align-middle text-lg uppercase sm:gap-4 lg:p-0"
          href="https://buyholdearn.com"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo.jpg"
            alt="EARN logo"
            className="ml-0 h-10 w-auto overflow-hidden rounded-xl p-1"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 sm:w-fit sm:scale-100">Home</div>
        </a>
      </div>
      <div className="my-auto h-fit w-fit flex-row rounded-xl border-2 border-black bg-button font-bold text-black hover:bg-buttonHover sm:w-44 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex h-10 items-center align-middle text-lg uppercase sm:gap-1 sm:text-center lg:p-0 "
          href="https://opensea.io/collection/flamelings"
          rel="noopener noreferrer"
        >
          <Image
            src="/opensea.png"
            alt="Opeansea logo"
            className="mx-1 h-8 w-auto overflow-hidden rounded-xl"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 justify-self-center sm:ml-2 sm:w-fit sm:scale-100">
            OPENSEA
          </div>
        </a>
      </div>

      <div className="my-auto h-fit w-fit flex-row rounded-xl border-2 border-black bg-button font-bold text-black hover:bg-buttonHover sm:w-44 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex h-10 items-center align-middle text-lg uppercase sm:gap-1 sm:text-center lg:p-0 "
          href="https://app.uniswap.org/swap?outputCurrency=0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E"
          rel="noopener noreferrer"
        >
          <Image
            src="/uniswap.png"
            alt="Uniswap logo"
            className="mx-1 h-8 w-auto overflow-hidden rounded-xl"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 sm:w-fit sm:scale-100">BUY $EARN</div>
        </a>
      </div>
    </nav>
  );
}
