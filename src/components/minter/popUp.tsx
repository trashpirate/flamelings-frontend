import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

const NFT_FEE = Number(process.env.NEXT_PUBLIC_MINT_FEE);

type Props = {
  isOpen: boolean;
  openModal: any;
  closeModal: any;
  mint: any;
  readyToMint: boolean;
  isMinting: boolean;
  isApproving: boolean;
  quantity: string;
};

export default function PopUp({
  isOpen,
  openModal,
  closeModal,
  mint,
  readyToMint,
  isMinting,
  isApproving,
  quantity,
}: Props) {
  function getDialogText() {
    if (readyToMint) {
      if (isMinting) {
        return "Minting...";
      } else {
        return `Confirm transaction in your wallet to birth ${
          quantity == "1" ? "1 cute Flameling!" : `${quantity} cute Flamelings!`
        }`;
      }
    } else {
      if (isApproving) {
        return `Approving...`;
      } else {
        return `Approve ${(Number(quantity) * NFT_FEE).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          },
        )} ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL} in your wallet to mint ${
          quantity == "1" ? "1 Flameling." : `${quantity} Flamelings.`
        }`;
      }
    }
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
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
                    {readyToMint
                      ? `Confirm NFT Mint`
                      : `Approve ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}`}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{getDialogText()}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      className="h-12 rounded-xl border-2 border-black bg-primary px-5 py-3 font-bold text-black hover:border-primary hover:bg-hover"
                      disabled={!readyToMint}
                      onClick={(e) => {
                        mint?.();
                      }}
                    >
                      {"MINT"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
