import React, { useState } from "react";

type Props = {
  insufficientFunds: boolean;
  maxPerWalletExceeded: boolean;
  maxPerWallet: number | undefined;
  mintAuthorized: boolean | undefined;
  buttonEnabled: boolean;
  approve: any;
  mint: any;
  openPopUp: any;
  closePopUp: any;
};

export default function MintButton({
  insufficientFunds,
  maxPerWalletExceeded,
  maxPerWallet,
  mintAuthorized,
  buttonEnabled,
  approve,
  mint,
  openPopUp,
  closePopUp,
}: Props) {
  let buttonText: string;
  //   console.log(mintAuthorized);
  //   console.log(buttonEnabled);
  if (mintAuthorized) buttonText = "CONFIRM MINT";
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
  } else if (maxPerWalletExceeded) {
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
            if (!mintAuthorized) {
              openPopUp();
              approve?.();
            } else {
              closePopUp();
              mint?.();
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    );
  }
}
