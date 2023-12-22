"use client";
import { nftABI } from "@/assets/nftABI";
import { tokenABI } from "@/assets/tokenABI";
import React, { Fragment, useEffect, useState } from "react";

import { parseUnits } from "viem";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import MintAnimation from "./mintAnimation";
import MintMessage from "./mintMessage";
import MintInputPanel from "./mintInputPanel";
import MintButton from "./mintButton";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NFT_FEE = 100000;

type Props = {};

export default function Minter({}: Props) {
  const [quantity, setQuantity] = useState<string>("1");
  const [transferAmount, setTransferAmount] = useState<bigint>(
    parseUnits(
      NFT_FEE.toString(),
      Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS),
    ),
  );
  const [approvedAmount, setApprovedAmount] = useState<bigint | undefined>(
    undefined,
  );
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(
    undefined,
  );
  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [maxPerWallet, setMaxPerWallet] = useState<number | undefined>(
    undefined,
  );
  const [batchLimit, setBatchLimit] = useState<number | undefined>(undefined);
  const [mintAuthorized, setMintAuthorized] = useState<boolean | undefined>(
    undefined,
  );
  const [mintEnabled, setMintEnabled] = useState<boolean>(false);
  const [buttonEnabled, setButtonEnabled] = useState<boolean>(false);
  const [insufficientFunds, setInsufficientFunds] = useState<boolean>(false);
  const [maxPerWalletExceeded, setMaxPerWalletExceeded] =
    useState<boolean>(false);
  const [soldOut, setSoldOut] = useState<boolean>(false);

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

  // read token info
  const { data: accountData } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        ...tokenContract,
        functionName: "allowance",
        args: [address as `0x${string}`, NFT_CONTRACT],
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
    cacheOnBlock: true,
  });

  // read nft balance
  const { data: nftData } = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        ...nftContract,
        functionName: "getBatchLimit",
      },
      {
        ...nftContract,
        functionName: "getMaxPerWallet",
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
    cacheOnBlock: true,
  });

  useEffect(() => {
    nftData
      ? setNftBalance(Number(nftData[0].result))
      : setNftBalance(undefined);
    nftData
      ? setBatchLimit(Number(nftData[1].result))
      : setBatchLimit(undefined);
    nftData
      ? setMaxPerWallet(Number(nftData[2].result))
      : setMaxPerWallet(undefined);
  }, [nftData]);

  useEffect(() => {
    accountData
      ? setTokenBalance(accountData[0].result)
      : setTokenBalance(undefined);
    accountData
      ? setApprovedAmount(accountData[1].result)
      : setApprovedAmount(undefined);
  }, [accountData]);

  // approving funds
  const { config: approvalConfig } = usePrepareContractWrite({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: tokenABI,
    functionName: "approve",
    args: [NFT_CONTRACT, transferAmount],
    enabled: isConnected && !mintAuthorized,
  });

  const { data: approvedData, write: approve } =
    useContractWrite(approvalConfig);

  const { isLoading: approvalLoading, isSuccess: approvalSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: approvedData?.hash,
    });

  // mint nfts
  const { config: mintConfig } = usePrepareContractWrite({
    ...nftContract,
    functionName: "mint",
    args: [BigInt(quantity)],
    enabled: mintAuthorized === true && isConnected,
  });
  const { data: mintData, write: mint } = useContractWrite(mintConfig);

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });

  // update authorization for minting
  useEffect(() => {
    // console.log("-- variables");
    // console.log("approved amount: " + approvedAmount);
    // console.log("transfer amount: " + transferAmount);
    // console.log("nft balance: " + nftBalance);
    // console.log("max per wallet: " + maxPerWallet);
    // console.log("quantity: " + quantity);

    const isMintAuthorized = () => {
      if (
        approvedAmount === undefined ||
        nftBalance === undefined ||
        maxPerWallet === undefined ||
        transferAmount === undefined
      ) {
        return undefined;
      } else if (
        Number(quantity) > 0 &&
        nftBalance + Number(quantity) <= maxPerWallet &&
        approvedAmount >= transferAmount
      ) {
        return true;
      } else {
        return false;
      }
    };

    setMintAuthorized(isMintAuthorized());
  }, [approvedAmount, transferAmount, quantity, nftBalance, maxPerWallet]);

  useEffect(() => {
    if (mintAuthorized === true && approvalSuccess) {
      mint?.();
    }
  }, [mintAuthorized, approvalSuccess]);

  // update transfer amount
  useEffect(() => {
    if (Number(quantity) > 0)
      setTransferAmount(
        parseUnits(
          `${Number(quantity) * NFT_FEE}`,
          Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS),
        ),
      );
  }, [quantity]);

  // update mint status
  useEffect(() => {
    if (batchLimit === undefined || batchLimit === 0) setMintEnabled(false);
    else setMintEnabled(true);
  }, [batchLimit]);

  // update isufficient funds
  useEffect(() => {
    if (tokenBalance != undefined && tokenBalance < transferAmount)
      setInsufficientFunds(true);
    else setInsufficientFunds(false);
  }, [tokenBalance, transferAmount]);

  // update max per wallet exceeded
  useEffect(() => {
    if (
      nftBalance != undefined &&
      maxPerWallet != undefined &&
      nftBalance + Number(quantity) > maxPerWallet
    )
      setMaxPerWalletExceeded(true);
    else setMaxPerWalletExceeded(false);
  }, [nftBalance, quantity, maxPerWallet]);

  // update max per wallet exceeded
  useEffect(() => {
    if (
      approvalLoading ||
      isMintLoading ||
      (!mintAuthorized && !approve) ||
      (mintAuthorized && !mint)
    )
      setButtonEnabled(false);
    else setButtonEnabled(true);
  }, [approvalLoading, isMintLoading, mintAuthorized]);

  // ============================================================================
  // display elements

  const setMintQuantity = (value: string) => {
    setQuantity(value);
  };

  const getMintQuantity = () => {
    return quantity;
  };

  return (
    <>
      <div className="mx-auto h-full w-full max-w-sm flex-col justify-between rounded-lg bg-black p-8 shadow-inner-sym md:max-w-none">
        <MintAnimation
          isMintLoading={isMintLoading}
          isMintSuccess={isMintSuccess}
          isConnected={isConnected}
        ></MintAnimation>
        <MintMessage
          isMintLoading={isMintLoading}
          isMintSuccess={isMintSuccess}
          isApprovalLoading={approvalLoading}
        ></MintMessage>

        {mintEnabled ? (
          <div className="pt-2">
            <div className="my-4 justify-center text-center">
              <MintInputPanel
                setMintQuantity={setMintQuantity}
                getMintQuantity={getMintQuantity}
                batchLimit={batchLimit}
              ></MintInputPanel>
            </div>
            {/* <div className="mt-2 flex justify-center">{mintButton()}</div> */}
            <div className="mt-2 flex justify-center">
              <MintButton
                insufficientFunds={insufficientFunds}
                maxPerWalletExceeded={maxPerWalletExceeded}
                maxPerWallet={maxPerWallet}
                mintAuthorized={mintAuthorized}
                buttonEnabled={buttonEnabled}
                approve={approve}
                mint={mint}
              ></MintButton>
            </div>
          </div>
        ) : (
          <div className="flex-col justify-center gap-4 text-center">
            <p className="my-8">MINT STARTS ON DEC 23TH, 1PM CST</p>
            <div className="mx-auto my-2 flex h-12 w-fit rounded-xl border-2 border-black bg-primary px-4 align-middle font-bold text-black hover:border-primary hover:bg-hover">
              <a
                className="m-auto"
                href="https://app.uniswap.org/swap?outputCurrency=0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E"
                target={"_blank"}
              >
                <p>{`BUY $${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}`}</p>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
