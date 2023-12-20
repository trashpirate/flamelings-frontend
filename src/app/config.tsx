import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

export default function getWagmiConfig(useTest: string) {
  if (useTest == "true") {
    const { chains, publicClient } = configureChains(
      [sepolia],
      [
        alchemyProvider({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
        }),
        publicProvider(),
      ],
    );

    const { connectors } = getDefaultWallets({
      appName: process.env.NEXT_PUBLIC_PROJECT_NAME as string,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
      chains,
    });

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors,
      publicClient,
    });

    return { config: wagmiConfig, chains: chains };
  } else {
    const { chains, publicClient } = configureChains(
      [mainnet],
      [
        alchemyProvider({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
        }),
        publicProvider(),
      ],
    );

    const { connectors } = getDefaultWallets({
      appName: process.env.NEXT_PUBLIC_PROJECT_NAME as string,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
      chains,
    });

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors,
      publicClient,
    });

    return { config: wagmiConfig, chains: chains };
  }
}
