import React, { useState } from "react";

type Props = {
  readyToMint: boolean | undefined;
  approve: any;
  mint: any;
  isMinting: boolean;
  isApproving: boolean;
};

export default function PopUpButton({
  readyToMint,
  approve,
  mint,
  isMinting,
  isApproving,
}: Props) {
  let buttonText: string;
  let buttonEnabled: boolean;

  if (readyToMint) {
    if (!mint || isMinting) {
      buttonEnabled = false;
    } else {
      buttonEnabled = true;
    }
    buttonText = "MINT";
  } else {
    if (!approve || isApproving) {
      buttonEnabled = false;
    } else {
      buttonEnabled = true;
    }
    buttonText = "APPROVE";
  }

  // approve or mint
  return (
    <div>
      <button
        className="h-12 rounded-xl border-2 border-black bg-primary px-5 py-3 font-bold text-black hover:border-primary hover:bg-hover"
        disabled={!buttonEnabled}
        onClick={(e) => {
          if (!readyToMint) {
            approve?.();
          } else {
            mint?.();
          }
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}
