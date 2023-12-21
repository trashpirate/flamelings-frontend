"use client";
import { nftABI } from "@/assets/nftABI";
import { tokenABI } from "@/assets/tokenABI";
import React, { Fragment, useEffect, useState } from "react";
import Image from "next/image";

import { parseUnits } from "viem";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Dialog, Transition } from "@headlessui/react";

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

  const [buttonText, setButtonText] = useState<string>("MINT");
  const [imagePath, setImagePath] = useState<string>("/logo.png");
  const [message, setMessage] = useState<string>(
    "Mint an NFT and win a prize!",
  );

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
    enabled: isConnected && mintAuthorized,
  });
  const { data: mintData, write: mint } = useContractWrite(mintConfig);

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });

  // update authorization for minting
  useEffect(() => {
    console.log("-- variables");
    console.log(approvedAmount);
    console.log(transferAmount);
    console.log(nftBalance);
    console.log(maxPerWallet);
    console.log(quantity);

    if (
      approvedAmount == undefined ||
      nftBalance == undefined ||
      maxPerWallet == undefined ||
      transferAmount == undefined
    ) {
      console.log("-- undefined");
      setMintAuthorized(undefined);
    } else if (
      Number(quantity) > 0 &&
      nftBalance + Number(quantity) <= maxPerWallet &&
      approvedAmount >= transferAmount
    ) {
      console.log("-- true");
      setMintAuthorized(true);
    } else {
      console.log("-- false");
      setMintAuthorized(false);
    }
    console.log(mintAuthorized);
  }, [approvedAmount, transferAmount, quantity, nftBalance, maxPerWallet]);

  useEffect(() => {
    if (mintAuthorized != undefined && mintAuthorized && approvalSuccess) {
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

  // ============================================================================
  // display elements

  // set image path
  useEffect(() => {
    if (isMintLoading && isConnected) {
      setImagePath("/nftAnimation.gif");
    } else if (!isMintLoading && isMintSuccess && isConnected) {
      setImagePath("/featured_image.jpg");
      setMessage("Minting completed.");
    } else {
      setImagePath("/featured_image.jpg");
    }
  }, [isMintLoading, isMintSuccess, isConnected]);

  useEffect(() => {
    if (isMintLoading) setButtonText("Minting...");
    else if (approvalLoading) setButtonText("Approving Funds...");
    else if (mintAuthorized) setButtonText("CONFIRM MINT");
    else setButtonText("MINT");
  }, [isMintLoading, approvalLoading, mintAuthorized]);

  function mintButton() {
    if (isDisconnected && batchLimit) {
      return <div className="mt-4">Connect your wallet to mint an NFT</div>;
    } else if (batchLimit) {
      // mint is enabled
      // =====================================================
      if (tokenBalance != undefined && tokenBalance < transferAmount) {
        return (
          <button
            className="bg-buttonInactive text-buttonInactiveText rounded-xl px-5 py-3"
            disabled={true}
            onClick={(e) => {}}
          >
            Insufficient Balance
          </button>
        );
      } else if (
        nftBalance != undefined &&
        maxPerWallet != undefined &&
        nftBalance + Number(quantity) > maxPerWallet
      ) {
        // max per wallet exceeded
        return (
          <button
            className="bg-buttonInactive text-buttonInactiveText rounded-xl px-5 py-3"
            disabled={true}
            onClick={(e) => {}}
          >
            {`Max. ${maxPerWallet} NFTs/Wallet`}
          </button>
        );
        // TODO: no more nfts to mint
        // SOLD OUT
      } else {
        // minting enabled
        return (
          <button
            className="h-12 rounded-xl border-2 border-black bg-primary px-5 py-3 font-bold text-black hover:border-primary hover:bg-hover"
            disabled={
              isMintLoading ||
              (!mintAuthorized && !approve) ||
              (mintAuthorized && !mint)
            }
            onClick={(e) => {
              if (!mintAuthorized) {
                // openModal();
                approve?.();
              } else {
                mint?.();
              }
            }}
          >
            {buttonText}
          </button>
        );
      }
    } else {
      return <div>NFT MINT STARTS ON JANUARY 12TH</div>;
    }
  }

  function mintPanel(canMint: number) {
    if (canMint > 0) {
      return (
        <div className="pt-2">
          <div className="flex h-14 justify-center">
            <h1 className="my-auto text-center align-middle text-lg text-primary">
              {message}
            </h1>
          </div>
          <div className="my-4 justify-center text-center">
            <form>
              <label>
                Enter number of NFTs:
                <input
                  className="bg-inputBackground mx-auto ml-3 rounded p-1 text-center"
                  type="number"
                  value={quantity}
                  max={batchLimit}
                  min="1"
                  placeholder="1"
                  onChange={(e) => {
                    setQuantity(e.target.value);
                  }}
                />
              </label>
            </form>
          </div>
          <div className="mt-2 flex justify-center">{mintButton()}</div>
        </div>
      );
    } else {
      return (
        <div className="flex-col justify-center gap-4 pt-4 text-center">
          <p className="my-8">MINT STARTS ON DEC 25TH, 1PM CST</p>
          <div className="mx-auto my-2 h-12 w-fit rounded-xl border-2 border-black bg-primary px-4 py-2 font-bold text-black hover:border-primary hover:bg-hover">
            <a
              className="m-auto"
              href="https://pancakeswap.finance/swap?chain=bsc&outputCurrency=0xdB238123939637D65a03E4b2b485650B4f9D91CB"
              target={"_blank"}
            >
              <p>{`BUY $${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}`}</p>
            </a>
          </div>
        </div>
      );
    }
  }

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="mx-auto h-full w-full max-w-sm flex-col justify-between rounded-lg bg-black p-8 shadow-inner-sym md:max-w-none">
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
            <div className="m-1 text-black">{`${
              NFT_FEE / 1000
            }${String.fromCharCode(8239)}K $${
              process.env.NEXT_PUBLIC_TOKEN_SYMBOL
            } PER NFT`}</div>
          </div>
        </div>
        {batchLimit ? mintPanel(batchLimit) : mintPanel(0)}
      </div>
      {/* <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {`Approve ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}`}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {`Confirm in your wallet to approve ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL} to mint NFTs.`}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      disabled={
                        isMintLoading ||
                        approvalLoading ||
                        approvedAmount == undefined ||
                        approvedAmount < transferAmount ||
                        (approvedAmount >= transferAmount && !mint)
                      }
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={(e) => {
                        mint?.();
                        closeModal();
                      }}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition> */}
    </>
  );
}
