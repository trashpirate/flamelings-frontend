"use client";
import React, {useEffect, useState} from "react";
import {useAccount, useContractRead, useNetwork} from "wagmi";

import {tokenABI} from "@/assets/tokenABI";
import {formatUnits} from "viem";
import {ConnectKitButton} from "connectkit";
import {nftABI} from "@/assets/nftABI";
import {ConnectButton} from "@rainbow-me/rainbowkit";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${ string }`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${ string }`;

interface NFTMeta {
  name: string;
  description: string;
  url: string;
  id: number;
}

type Props = {};

export default function AccountInfo({}: Props) {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [nftBalance, setNftBalance] = useState<number | null>(null);

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

  // check balance
  const {isLoading, isSuccess, isError} = useContractRead({
    ...tokenContract,
    functionName: "balanceOf",
    args: [address as `0x${ string }`],
    enabled: isConnected && address != null,
    watch: true,
    cacheTime: 2000,
    onSuccess(data: bigint) {
      setTokenBalance(
        Number(
          formatUnits(data, Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS)),
        ),
      );
    },
  });

  // read nft balance
  const {
    isError: isNftError,
    isLoading: isNftLoading,
    isSuccess: isNftSuccess,
  } = useContractRead({
    ...nftContract,
    functionName: "balanceOf",
    args: [address as `0x${ string }`],
    enabled: isConnected && address != null,
    watch: true,
    cacheTime: 2000,
    onSuccess(data) {
      setNftBalance(Number(data));
    },
  });

  function getBalanceString() {
    let text: string = "---";
    if (isLoading) {
      text = "Loading...";
    } else if (isSuccess && tokenBalance != null) {
      let truncBalance: number;
      let letter: string;
      if (tokenBalance >= 1000000000000) {
        truncBalance = tokenBalance / 1000000000000;
        letter = "T";
      } else if (tokenBalance >= 1000000000) {
        truncBalance = tokenBalance / 1000000000;
        letter = "B";
      } else if (tokenBalance >= 1000000) {
        truncBalance = tokenBalance / 1000000;
        letter = "M";
      } else if (tokenBalance >= 1000) {
        truncBalance = tokenBalance / 1000;
        letter = "K";
      } else {
        truncBalance = tokenBalance;
        letter = "";
      }
      text = `${ truncBalance.toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }) }${ String.fromCharCode(8239) }${ letter } ${ process.env.NEXT_PUBLIC_TOKEN_SYMBOL
        }`;
    } else {
      text = "---";
    }
    return text;
  }

  function getNftBalanceString() {
    let text: string = "---";
    if (isNftLoading) {
      text = "Loading...";
    } else if (isNftSuccess && nftBalance != null) {
      text = `${ nftBalance }`;
    } else {
      text = "---";
    }
    return text;
  }

  return (
    <div className="h-full w-full ">
      <div className="mx-auto h-full max-w-sm  rounded-md bg-black/90 backdrop-blur p-8 md:max-w-none">
        <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl">
          ACCOUNT INFO
        </h2>
        <div className="mb-4 py-2">
          <ConnectButton
            accountStatus="address"
            showBalance={true}
            chainStatus="icon"
          />
        </div>

        <div className="flex justify-between">
          <h3>Balance: </h3>
          <p>{getBalanceString()}</p>
        </div>
        <div className="flex justify-between">
          <h3>NFTs: </h3>
          <p>{getNftBalanceString()}</p>
        </div>
      </div>
    </div>
  );
}
