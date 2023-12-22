import React, { useState } from "react";

type Props = {
  setMintQuantity: any;
  getMintQuantity: any;
  batchLimit: any;
};

export default function MintInputPanel({
  setMintQuantity,
  getMintQuantity,
  batchLimit,
}: Props) {
  return (
    <div className="my-4 justify-center text-center">
      <form>
        <label>
          Enter number of NFTs:
          <input
            className="mx-auto ml-3 rounded bg-inputBackground p-1 text-center"
            type="number"
            value={getMintQuantity()}
            max={batchLimit}
            min="1"
            placeholder="1"
            onChange={(e) => {
              setMintQuantity(e.target.value);
            }}
          />
        </label>
      </form>
    </div>
  );
}
