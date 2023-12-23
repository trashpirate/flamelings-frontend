"use client";
import React, { useEffect, useState } from "react";
import {
  useAccount,
  useContractEvent,
  useContractReads,
  useNetwork,
} from "wagmi";
import { nftABI } from "@/assets/nftABI";
import { tokenABI } from "@/assets/tokenABI";
import Image from "next/image";
import Moralis from "moralis";
import Link from "next/link";
import { toHex } from "viem";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;

interface NFTMeta {
  name: string;
  path: string;
  id: number;
}

async function getNFT(
  chainId: string,
  maxPerWallet: number,
  address: `0x${string}`,
) {
  const response = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: chainId,
    format: "decimal",
    limit: maxPerWallet,
    excludeSpam: false,
    tokenAddresses: [NFT_CONTRACT],
    mediaItems: false,
    address: address as string,
  });

  const nfts = response.result;

  let nftArray: NFTMeta[] = [];
  const maxShow = maxPerWallet ? maxPerWallet : 10;
  for (let index = 1; index <= maxShow; index++) {
    const nft = nfts.at(-index);
    if (nft != undefined) {
      let imageURL: string = "/unrevealed.jpg";

      const res = await fetch(
        `https://bafybeic2a7jdsztni6jsnq2oarb3o5g7iuya5r4lcjfqi64rsucirdfobm.ipfs.nftstorage.link/${nft.tokenId}`,
      );
      const json = await res.json();
      const [prefix, separator, url, color, name] = json.image.split("/");
      imageURL = `https://bafybeiaf6ppnztlf3k5edqrgq3zae5ih2y6vhf255hekkqn6vjwazhq36q.ipfs.nftstorage.link/${color}/${name}`;

      let iNft: NFTMeta = {
        name: nft.name + " #" + nft.tokenId,
        id: Number(nft.tokenId),
        path: imageURL,
      };
      nftArray.push(iNft);
    } else {
      let iNft: NFTMeta = {
        name: "Flameling #?",
        id: index + 1100,
        path: "/unrevealed.jpg",
      };
      nftArray.push(iNft);
    }
  }

  return nftArray;
}

type Props = {};

export default function Nfts({}: Props) {
  const [maxPerWallet, setMaxPerWallet] = useState<number | undefined>(
    undefined,
  );
  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [nftsOwned, setNftsOwned] = useState<NFTMeta[] | undefined>(undefined);

  // get account address
  const { address, isConnecting, isDisconnected, isConnected } = useAccount({});

  // get chain
  const { chain } = useNetwork();

  // define token contract config
  const tokenContract = {
    address: TOKEN_CONTRACT,
    abi: tokenABI,
    chainId: chain?.id,
  };

  // define token contract config
  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  const { data, isSuccess, refetch } = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "getMaxPerWallet",
      },
      {
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
    // cacheOnBlock: true,
  });

  useContractEvent({
    ...tokenContract,
    eventName: "Transfer",
    listener(log: any) {
      // console.log(log);
      refetch();
    },
    chainId: chain?.id,
  });

  useEffect(() => {
    if (data != undefined) {
      setMaxPerWallet(Number(data[0].result));
      setNftBalance(Number(data[1].result));
      // console.log(nftBalance);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    async function startMoralis() {
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }
    }
    startMoralis();
  }, []);

  useEffect(() => {
    const chainId = chain ? toHex(chain.id) : "0x1";
    if (
      isConnected &&
      maxPerWallet != undefined &&
      address != undefined &&
      nftBalance != undefined
    ) {
      getNFT(chainId, maxPerWallet, address).then((nftArray) => {
        setNftsOwned(nftArray);
      });
    }
  }, [isConnected, nftBalance, address, maxPerWallet]);

  return (
    <div className="h-full w-full pb-8">
      <div className="mx-auto h-full max-w-sm rounded-md bg-black p-8 shadow-inner-sym sm:w-full md:max-w-none">
        <h2 className="border-b-2 border-primary pb-2 text-justify text-xl uppercase">
          Your NFTs (Max. 10)
        </h2>
        <div className="my-4 min-h-max">
          <div className="grid grid-cols-2 place-content-center gap-4 sm:grid-cols-3 md:grid-cols-5 ">
            {nftsOwned != undefined &&
              nftsOwned.map(function (nft) {
                let hover: string = "";
                if (nft.id <= 1000) hover = "  hover:border-primary";
                return (
                  <Link
                    key={nft.id}
                    href={`https://opensea.io/assets/ethereum/${NFT_CONTRACT}/${nft.id}`}
                  >
                    <div
                      className={
                        "my-2 overflow-hidden rounded-md border-2 border-white bg-white shadow" +
                        hover
                      }
                    >
                      {
                        <Image
                          alt={nft.name || ""}
                          src={`${nft.path}` as string}
                          width={100}
                          height={100}
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                        />
                      }
                      <div className="m-2 text-center text-xs font-bold text-black">
                        {nft.name}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
