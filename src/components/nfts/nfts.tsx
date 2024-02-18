"use client";
import React, {useEffect, useState} from "react";
import {useAccount, useContractReads, useNetwork} from "wagmi";
import {nftABI} from "@/assets/nftABI";
import {tokenABI} from "@/assets/tokenABI";
import Image from "next/image";
import {Alchemy, Network} from "alchemy-sdk";
import Link from "next/link";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${ string }`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${ string }`;

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network:
    process.env.NEXT_PUBLIC_TESTNET == "true"
      ? Network.ETH_SEPOLIA
      : Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

interface NFTMeta {
  name: string;
  path: string;
  id: number;
}

type Props = {};

export default function Nfts({}: Props) {
  const [maxPerWallet, setMaxPerWallet] = useState<number | undefined>(
    undefined,
  );
  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [nftsOwned, setNftsOwned] = useState<NFTMeta[] | undefined>(undefined);
  const [totalSupply, setTotalSupply] = useState<number | undefined>(undefined);

  // get account address
  const {address, isConnecting, isDisconnected, isConnected} = useAccount({});

  // get chain
  const {chain} = useNetwork();

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

  const {data, isSuccess, refetch} = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "getMaxPerWallet",
      },
      {
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${ string }`],
      },
      {
        ...nftContract,
        functionName: "totalSupply",
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
    cacheOnBlock: true,
  });

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (data != undefined) {
      setMaxPerWallet(Number(data[0].result));
      setNftBalance(Number(data[1].result));
      setTotalSupply(Number(data[2].result));
    }
  }, [data, isSuccess]);

  async function getNFT() {
    console.log("fetching");
    const owner = address as string;
    const options = {
      contractAddresses: [NFT_CONTRACT],
    };
    const nfts = await alchemy.nft.getNftsForOwner(owner, options);
    console.log(nfts);
    let nftArray: NFTMeta[] = [];
    const maxShow = maxPerWallet != undefined && maxPerWallet <= 10 ? maxPerWallet : 10;
    for (let index = 1; index <= maxShow; index++) {
      const nft = nfts["ownedNfts"].at(-index);
      if (nft != undefined) {
        let imageURL: string = "/unrevealed_2.jpg";

        const res = await fetch(
          `https://bafybeic2a7jdsztni6jsnq2oarb3o5g7iuya5r4lcjfqi64rsucirdfobm.ipfs.nftstorage.link/${ nft.tokenId }`,
        );
        const json = await res.json();
        const [prefix, separator, url, color, name] = json.image.split("/");
        imageURL = `https://bafybeiaf6ppnztlf3k5edqrgq3zae5ih2y6vhf255hekkqn6vjwazhq36q.ipfs.nftstorage.link/${ color }/${ name }`;
        console.log(nft);
        let iNft: NFTMeta = {
          name: nft["contract"].name
            ? `${ nft["contract"].name }  #${ nft.tokenId }`
            : "Flameling #?",
          id: Number(nft.tokenId),
          path: imageURL,
        };
        nftArray.push(iNft);
      } else {
        let iNft: NFTMeta = {
          name: "Flameling #?",
          id: index + 1100,
          path: "/unrevealed_2.jpg",
        };
        nftArray.push(iNft);
      }
    }

    setNftsOwned(nftArray);
  }

  useEffect(() => {
    if (isConnected) {
      getNFT();
    }
  }, [isConnected, nftBalance]);

  return (
    <div className="h-full w-full pb-8">
      <div className="mx-auto h-full max-w-sm rounded-md bg-black p-8 sm:w-full md:max-w-none">
        <h2 className="border-b-2 border-primary pb-2 text-justify text-xl uppercase">
          {`Your recently minted NFTs (Max. ${ maxPerWallet })`}
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
                    href={`https://opensea.io/assets/ethereum/${ NFT_CONTRACT }/${ nft.id }`}
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
                          src={`${ nft.path }` as string}
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
