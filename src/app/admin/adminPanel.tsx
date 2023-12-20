"use client";
import { nftABI } from "@/assets/nftABI";
import React, { useState, useEffect } from "react";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

type Props = {};

export default function AdminPanel({}: Props) {
  const [batchLimit, setBatchLimit] = useState<string>("");
  const [maxPerWallet, setMaxPerWallet] = useState<string>("");
  const [contractOwner, setContractOwner] = useState<`0x${string}`>("0x");
  const [actualBatchLimit, setActualBatchLimit] = useState<number | undefined>(
    undefined,
  );
  const [actualMaxPerWallet, setActualMaxPerWallet] = useState<
    number | undefined
  >(undefined);

  // get account address
  const { address, isConnecting, isDisconnected, isConnected } = useAccount({});

  // get chain
  const { chain } = useNetwork();

  // define contract config
  const nftContract = {
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`,
    abi: nftABI,
    chainId: chain?.id,
  };

  // read current limits
  const {
    data: readLimitData,
    isSuccess: readLimitSuccess,
    isError: readLimitError,
    isLoading: readLimitLoading,
  } = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "getMaxPerWallet",
      },
      {
        ...nftContract,
        functionName: "getBatchLimit",
      },
      {
        ...nftContract,
        functionName: "owner",
      },
    ],
    watch: true,
  });

  // set max per wallet
  const { config: maxPerWalletConfig, error: maxPerWalletError } =
    usePrepareContractWrite({
      ...nftContract,
      functionName: "setMaxPerWallet",
      account: address,
      args: [BigInt(maxPerWallet)],
    });
  const { write: writeMaxPerWallet } = useContractWrite(maxPerWalletConfig);

  // set batch limit
  const { config: batchLimitConfig, error: batchLimitError } =
    usePrepareContractWrite({
      ...nftContract,
      functionName: "setBatchLimit",
      account: address,
      args: [BigInt(batchLimit)],
    });
  const { data: batchData, write: writeBatchLimit } =
    useContractWrite(batchLimitConfig);

  const { isLoading: batchLoading, isSuccess: batchSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: batchData?.hash,
    });

  useEffect(() => {
    if (readLimitData != undefined) {
      setActualMaxPerWallet(Number(readLimitData?.[0].result));
      setActualBatchLimit(Number(readLimitData?.[1].result));
      setContractOwner(readLimitData?.[2].result as `0x${string}`);
    }
  }, [readLimitData]);

  return (
    <div className="p-16">
      {contractOwner == address ? (
        <h4 className="py-2 italic text-green-600">Authorized</h4>
      ) : (
        <h4 className="py-2 italic text-red-600">Unauthorized</h4>
      )}

      <div className="flex">
        <div className="mb-4 flex">
          <h4 className="mr-2">Max Per Wallet:</h4>
          <p>
            {actualMaxPerWallet == undefined
              ? "Loading..."
              : actualMaxPerWallet}
          </p>
        </div>
        <div className="mx-2 mb-4 flex">
          <h4 className="mr-2">Batch Limit:</h4>
          <p>
            {actualBatchLimit == undefined ? "Loading..." : actualBatchLimit}
          </p>
        </div>
      </div>
      <div className="my-4">
        <form>
          <label>
            Enter max per wallet:
            <input
              className="ml-2 w-16 rounded px-2 text-black"
              type="number"
              value={maxPerWallet}
              min={readLimitSuccess ? Number(readLimitData?.[1].result) : "0"}
              placeholder={
                actualMaxPerWallet != undefined
                  ? actualMaxPerWallet.toString()
                  : "1"
              }
              onChange={(e) => {
                setMaxPerWallet(e.target.value);
              }}
            />
          </label>
        </form>
        <button
          className="my-2 rounded border-2 border-white p-2 hover:cursor-pointer hover:bg-gray-800"
          disabled={
            !writeMaxPerWallet ||
            (actualBatchLimit != undefined &&
              Number(maxPerWallet) < actualBatchLimit)
          }
          onClick={() => {
            writeMaxPerWallet?.();
          }}
        >
          Set Max Per Wallet
        </button>
      </div>
      <div className="my-4">
        <form>
          <label>
            Enter batch limit:
            <input
              className="ml-2 w-16 rounded px-2 text-black"
              type="number"
              value={batchLimit}
              min="0"
              max={Math.min(20, actualMaxPerWallet ? actualMaxPerWallet : 20)}
              placeholder={
                actualBatchLimit != undefined
                  ? actualBatchLimit.toString()
                  : "1"
              }
              onChange={(e) => {
                setBatchLimit(e.target.value);
              }}
            />
          </label>
        </form>
        <button
          className="my-2 rounded border-2 border-white p-2 hover:cursor-pointer hover:bg-gray-800"
          disabled={
            !writeBatchLimit ||
            (actualMaxPerWallet != undefined &&
              actualMaxPerWallet < Number(batchLimit))
          }
          onClick={() => {
            writeBatchLimit?.();
          }}
        >
          Set Batch Limit
        </button>
      </div>
    </div>
  );
}
