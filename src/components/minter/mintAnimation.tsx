import React from "react";
import Image from "next/image";

const NFT_FEE = Number(process.env.NEXT_PUBLIC_MINT_FEE);

type Props = {
  isMintLoading: boolean;
  isConnected: boolean;
  isMintSuccess: boolean;
};

export default function MintAnimation({
  isMintLoading,
  isMintSuccess,
  isConnected,
}: Props) {
  let imagePath: string;

  if (isMintLoading && isConnected) {
    imagePath = "/nftAnimation.gif";
  } else if (!isMintLoading && isMintSuccess && isConnected) {
    imagePath = "/featured_image.jpg";
  } else {
    imagePath = "/featured_image.jpg";
  }

  return (
    <div className="mx-auto mb-4 w-full max-w-xs overflow-hidden rounded border-2 border-white bg-white">
      <Image
        src={imagePath}
        width={250}
        height={250}
        alt="Flameling NFTs"
        style={{
          width: "100%",
          height: "auto",
        }}
        priority
      />
      <div className="m-4">
        <div className="m-1 font-bold text-black">{"Flamelings"}</div>
        <div className="m-1 text-black">{`${NFT_FEE / 1000
          }${String.fromCharCode(8239)}K $${process.env.NEXT_PUBLIC_TOKEN_SYMBOL
          } PER NFT`}</div>
      </div>
    </div>
  );
}
