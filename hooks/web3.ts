import { alchemy } from "@/lib/clients";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

/**
 * Example hook to fetch NFTs for a user
 * @param address - The address of the user
 * @returns The NFTs for the user
 */
export function useGetNftForUser(address: Address) {
  return useQuery({
    queryKey: ["nft", address],
    queryFn: async () => {
      const nft = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: ["example-contract-address"],
      });
      return nft;
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
