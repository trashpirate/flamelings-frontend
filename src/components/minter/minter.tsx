"use client";
import { nftABI } from "@/assets/nftABI";
import { tokenABI } from "@/assets/tokenABI";
import React, { useEffect, useState } from "react";

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
import PopUp from "./popUp";

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

  // token contract states
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(
    undefined,
  );
  const [approvedAmount, setApprovedAmount] = useState<bigint | undefined>(
    undefined,
  );

  // nft contract states
  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [maxPerWallet, setMaxPerWallet] = useState<number | undefined>(
    undefined,
  );
  const [batchLimit, setBatchLimit] = useState<number | undefined>(undefined);

  // mint eligibility checks
  const [mintStarted, setMintStarted] = useState<boolean>(false);
  const [readyToMint, setReadyToMint] = useState<boolean>(false);
  const [buttonEnabled, setButtonEnabled] = useState<boolean>(false);
  const [insufficientFunds, setInsufficientFunds] = useState<boolean>(false);
  const [maxExceeded, setMaxExceeded] = useState<boolean>(false);
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
  const {
    data: accountData,
    refetch: refetchTokenContract,
    isSuccess: isTokenReadSuccess,
    isLoading: isTokenReadLoading,
  } = useContractReads({
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

  // read nft info
  const {
    data: nftData,
    refetch: refetchNftContract,
    isSuccess: isNftReadSuccess,
    isLoading: isNftReadLoading,
  } = useContractReads({
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

  // set nft contract states
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

  // token contract states
  useEffect(() => {
    accountData
      ? setTokenBalance(accountData[0].result)
      : setTokenBalance(undefined);
    accountData
      ? setApprovedAmount(accountData[1].result)
      : setApprovedAmount(undefined);
  }, [accountData]);

  // WRITE CONTRACTS
  // =========================================================

  // approving funds
  const { config: approvalConfig } = usePrepareContractWrite({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: tokenABI,
    functionName: "approve",
    args: [NFT_CONTRACT, transferAmount],
    enabled: isConnected && !readyToMint,
  });

  const {
    data: approvedData,
    write: approve,
    isError: approvalError,
  } = useContractWrite(approvalConfig);

  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: approvedData?.hash,
    });

  // mint nfts
  const { config: mintConfig } = usePrepareContractWrite({
    ...nftContract,
    functionName: "mint",
    args: [BigInt(quantity)],
    enabled: readyToMint === true && isConnected,
  });

  const {
    data: mintData,
    write: mint,
    isError: mintError,
  } = useContractWrite(mintConfig);

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });

  useEffect(() => {
    refetchTokenContract();
    refetchNftContract();
  }, []);

  // handle error
  useEffect(() => {
    if (mintError || approvalError) {
      closeModal();
    }
  }, [mintError, approvalError]);

  // refetch data after approval and mint
  useEffect(() => {
    if (isMintSuccess) {
      refetchTokenContract();
      refetchNftContract();
      closeModal();
    }
  }, [isMintSuccess]);

  useEffect(() => {
    if (isApprovalSuccess) {
      refetchTokenContract();
    }
  }, [isApprovalSuccess]);

  // update authorization for minting
  useEffect(() => {
    const isMintAuthorized = () => {
      if (
        approvedAmount === undefined ||
        nftBalance === undefined ||
        maxPerWallet === undefined ||
        transferAmount === undefined
      ) {
        return false;
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
    setReadyToMint(isMintAuthorized());
  }, [
    approvedAmount,
    transferAmount,
    quantity,
    nftBalance,
    maxPerWallet,
    isNftReadSuccess,
    isTokenReadSuccess,
  ]);

  // update transfer amount
  useEffect(() => {
    if (Number(quantity) > 0) {
      const decimals = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS);
      const amount = parseUnits(`${Number(quantity) * NFT_FEE}`, decimals);
      setTransferAmount(amount);
    }
  }, [quantity]);

  // update mint status
  useEffect(() => {
    if (batchLimit != undefined) {
      if (batchLimit === 0) setMintStarted(false);
      else setMintStarted(true);
    }
  }, [batchLimit, isNftReadSuccess]);

  // update isufficient funds
  useEffect(() => {
    if (tokenBalance === undefined) {
      setInsufficientFunds(true);
    } else {
      if (tokenBalance < transferAmount) setInsufficientFunds(true);
      else setInsufficientFunds(false);
    }
  }, [tokenBalance, transferAmount, isTokenReadSuccess]);

  // update max per wallet exceeded
  useEffect(() => {
    if (nftBalance == undefined || maxPerWallet == undefined) {
      setMaxExceeded(true);
    } else {
      if (nftBalance + Number(quantity) > maxPerWallet) setMaxExceeded(true);
      else setMaxExceeded(false);
    }
  }, [nftBalance, quantity, maxPerWallet, isNftReadSuccess]);

  // update button enabled
  useEffect(() => {
    const isButtonEnabled = () => {
      if (readyToMint) {
        if (isApprovalLoading || isMintLoading || !mint) {
          return false;
        } else {
          return true;
        }
      } else {
        if (!approve) {
          return false;
        } else {
          return true;
        }
      }
    };

    setButtonEnabled(isButtonEnabled());
  }, [
    isApprovalLoading,
    isMintLoading,
    readyToMint,
    isTokenReadSuccess,
    isNftReadSuccess,
  ]);

  // ============================================================================
  // display elements

  const setMintQuantity = (value: string) => {
    setQuantity(value);
  };

  const getMintQuantity = () => {
    return quantity;
  };

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
        <MintAnimation
          isMintLoading={isMintLoading}
          isMintSuccess={isMintSuccess}
          isConnected={isConnected}
        ></MintAnimation>
        <MintMessage
          isMintLoading={isMintLoading}
          isMintSuccess={isMintSuccess}
          isApprovalLoading={isApprovalLoading}
        ></MintMessage>

        {mintStarted ? (
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
                maxExceeded={maxExceeded}
                maxPerWallet={maxPerWallet}
                readyToMint={readyToMint}
                buttonEnabled={buttonEnabled}
                approve={approve}
                mint={mint}
                openPopUp={openModal}
                closePopUp={closeModal}
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
      <PopUp
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        mint={mint}
        approve={approve}
        readyToMint={readyToMint ? readyToMint : false}
        isApproving={isApprovalLoading && !isApprovalSuccess}
        isMinting={isMintLoading && !isMintSuccess}
        quantity={quantity}
      ></PopUp>
    </>
  );
}
