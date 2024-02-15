import React from "react";

type Props = {
  isMintLoading: boolean;
  isMintSuccess: boolean;
  isApprovalLoading: boolean;
};

export default function MintMessage({
  isMintLoading,
  isMintSuccess,
  isApprovalLoading,
}: Props) {
  let message: string;
  if (!isMintLoading && isMintSuccess) message = "Your Flamelings are born!";
  else if (isApprovalLoading) message = "Approving your funds...";
  else if (isMintLoading) message = "Birthing your Flameling...";
  else message = "Mint an NFT and EARN!";

  return (
    <div className="flex h-14 justify-center">
      <h1 className="my-auto text-center align-middle text-lg text-primary">
        {message}
      </h1>
    </div>
  );
}
