import { shape, shapeSepolia } from "viem/chains";

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getChainId(): typeof shape.id | typeof shapeSepolia.id {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  if (chainId !== shape.id && chainId !== shapeSepolia.id) {
    throw new Error(
      `Invalid NEXT_PUBLIC_CHAIN_ID: ${chainId}. Must be ${shape.id} (Shape Mainnet) or ${shapeSepolia.id} (Shape Sepolia)`,
    );
  }
  return chainId;
}

export const config = {
  chainId: getChainId(),
  alchemyKey: getRequiredEnvVar("NEXT_PUBLIC_ALCHEMY_KEY"),
  walletConnectProjectId: getRequiredEnvVar(
    "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
  ),
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
