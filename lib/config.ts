import { shape, shapeSepolia } from "viem/chains";

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // During build time, environment variables might not be available
    // Only throw in production runtime, not during build
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined"
    ) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  Missing environment variable: ${name}`);
      console.warn(`Please add ${name} to your .env file`);
    }

    // Return empty string as fallback during build
    return "";
  }
  return value;
}

function getChainId(): typeof shape.id | typeof shapeSepolia.id {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

  // Handle missing or invalid chain ID
  if (
    !process.env.NEXT_PUBLIC_CHAIN_ID ||
    (chainId !== shape.id && chainId !== shapeSepolia.id)
  ) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `⚠️  Invalid or missing NEXT_PUBLIC_CHAIN_ID: ${chainId}. Defaulting to Shape Sepolia (${shapeSepolia.id})`,
      );
    }
    return shapeSepolia.id; // Default to testnet
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
