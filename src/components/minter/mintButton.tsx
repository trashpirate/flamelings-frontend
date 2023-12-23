import React, { useState } from "react";

type Props = {
  insufficientFunds: boolean;
  maxExceeded: boolean;
  maxPerWallet: number | undefined;
  readyToMint: boolean | undefined;
  buttonEnabled: boolean;
  approve: any;
  mint: any;
  openPopUp: any;
  closePopUp: any;
};

export default function MintButton({
  insufficientFunds,
  maxExceeded,
  maxPerWallet,
  readyToMint,
  buttonEnabled,
  approve,
  mint,
  openPopUp,
  closePopUp,
}: Props) {
  let buttonText: string;
  //   console.log(readyToMint);
  //   console.log(buttonEnabled);
  if (readyToMint) buttonText = "CONFIRM MINT";
  else buttonText = "MINT";

  if (insufficientFunds) {
    // insufficient balance
    return (
      <div>
        <button
          className="rounded-xl bg-buttonInactive px-5 py-3 text-buttonInactiveText"
          disabled={true}
          onClick={(e) => {}}
        >
          Insufficient Balance
        </button>
      </div>
    );
  } else if (maxExceeded) {
    // max per wallet exceeded
    return (
      <div>
        <button
          className="rounded-xl bg-buttonInactive px-5 py-3 text-buttonInactiveText"
          disabled={true}
          onClick={(e) => {}}
        >
          {`Max. ${maxPerWallet} NFTs/Wallet`}
        </button>
      </div>
    );
  } else {
    // approve or mint
    return (
      <div>
        <button
          className="h-12 rounded-xl border-2 border-black bg-primary px-5 py-3 font-bold text-black hover:border-primary hover:bg-hover"
          disabled={!buttonEnabled}
          onClick={(e) => {
            openPopUp();
          }}
        >
          {buttonText}
        </button>
      </div>
    );
  }
}
