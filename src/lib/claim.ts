import { encodeFunctionData } from "viem";
import { AMG_REWARD_ABI } from "./amg-abi";
import { getActiveProvider } from "./wallet";

export async function claimAmgRewards(token: string, from: string): Promise<string> {
  const provider = getActiveProvider();
  if (!provider) throw new Error("Connect a wallet first.");
  const data = encodeFunctionData({
    abi: AMG_REWARD_ABI,
    functionName: "claim",
  });
  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: token, data }],
  });
  return String(hash);
}
