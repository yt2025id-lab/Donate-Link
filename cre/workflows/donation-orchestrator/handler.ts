/**
 * DonateLink CRE Workflow Handler
 *
 * This handler is triggered by DonationReceived events from the DonateLink
 * smart contract on Base Sepolia. It orchestrates the following:
 *
 * 1. Records the donation in Supabase via the DonateLink REST API
 * 2. Fetches current prices from CoinGecko for price context
 * 3. Generates a fun celebration message via OpenAI
 *
 * This satisfies the Chainlink Convergence Hackathon requirements:
 * - CRE Workflow with TypeScript handler
 * - Integrates blockchain (EVM Log trigger) with external APIs
 * - Uses HTTPClient for REST calls + AI/LLM integration
 */

// Types for the donation event data decoded from the EVM log
interface DonationEventData {
  donor: string;
  streamer: string;
  donorName: string;
  message: string;
  amountUsd: bigint;   // 8 decimals (Chainlink format)
  amountToken: bigint;
  tokenAddress: string;
  sourceChain: string;
  timestamp: bigint;
}

// Types for the trigger payload
interface TriggerPayload {
  data: DonationEventData;
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
}

// Types for the HTTP client
interface HTTPClient {
  get(url: string, options?: RequestOptions): Promise<HTTPResponse>;
  post(url: string, options?: RequestOptions): Promise<HTTPResponse>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  body?: string;
}

interface HTTPResponse {
  status: number;
  body: string;
}

// Types for the EVM client
interface EVMClient {
  readContract(params: {
    chainId: number;
    contractAddress: string;
    functionName: string;
    args: unknown[];
  }): Promise<unknown>;
}

interface HandlerContext {
  http: HTTPClient;
  evm: EVMClient;
}

// Token address to symbol mapping (Base Sepolia)
const TOKEN_SYMBOLS: Record<string, string> = {
  "0x0000000000000000000000000000000000000000": "ETH",
  // Add USDC and LINK addresses after deployment
};

function resolveTokenSymbol(tokenAddress: string): string {
  return TOKEN_SYMBOLS[tokenAddress.toLowerCase()] || "TOKEN";
}

function formatUsdFromChainlink(amountUsd: bigint): number {
  return Number(amountUsd) / 1e8;
}

function formatTokenAmount(amount: bigint, symbol: string): number {
  if (symbol === "USDC") return Number(amount) / 1e6;
  return Number(amount) / 1e18;
}

/**
 * Main handler function called by CRE when a DonationReceived event is detected
 */
export default async function handler(
  trigger: TriggerPayload,
  context: HandlerContext
): Promise<{ success: boolean; donationId?: string; celebrationMessage?: string }> {
  const { data, transactionHash } = trigger;
  const {
    donor,
    streamer,
    donorName,
    message,
    amountUsd,
    amountToken,
    tokenAddress,
    sourceChain,
  } = data;

  const tokenSymbol = resolveTokenSymbol(tokenAddress);
  const usdAmount = formatUsdFromChainlink(amountUsd);
  const tokenAmt = formatTokenAmount(amountToken, tokenSymbol);

  console.log(
    `[DonateLink CRE] Processing donation: ${usdAmount} USD from ${donorName} to ${streamer}`
  );

  // ============================================================
  // Step 1: Record donation in Supabase via DonateLink REST API
  // ============================================================
  let donationId: string | undefined;
  try {
    const apiUrl = process.env.DONATELINK_API_URL || "http://localhost:3000";
    const response = await context.http.post(`${apiUrl}/api/donate`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_SECRET}`,
      },
      body: JSON.stringify({
        streamer_address: streamer,
        donor_address: donor,
        donor_name: donorName || "Anonymous",
        message: message || "",
        amount_usd: usdAmount,
        amount_token: tokenAmt,
        token_symbol: tokenSymbol,
        token_address: tokenAddress,
        source_chain: sourceChain,
        tx_hash: transactionHash,
        ccip_message_id: null,
      }),
    });

    if (response.status === 200 || response.status === 201) {
      const result = JSON.parse(response.body);
      donationId = result.donation?.id;
      console.log(`[DonateLink CRE] Donation recorded in Supabase: ${donationId}`);
    } else {
      console.log(
        `[DonateLink CRE] API returned status ${response.status}: ${response.body}`
      );
    }
  } catch (err) {
    console.error("[DonateLink CRE] Failed to record donation:", err);
  }

  // ============================================================
  // Step 2: Enrich with CoinGecko price data
  // ============================================================
  let prices: Record<string, { usd: number }> = {};
  try {
    const priceResponse = await context.http.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,chainlink&vs_currencies=usd"
    );
    if (priceResponse.status === 200) {
      prices = JSON.parse(priceResponse.body);
      console.log(
        `[DonateLink CRE] Current prices - ETH: $${prices.ethereum?.usd}, LINK: $${prices.chainlink?.usd}`
      );
    }
  } catch (err) {
    console.error("[DonateLink CRE] Failed to fetch prices:", err);
  }

  // ============================================================
  // Step 3: Generate celebration message via OpenAI
  // (Satisfies hackathon requirement: "external API/LLM/AI agent")
  // ============================================================
  let celebrationMessage: string | undefined;
  try {
    if (process.env.OPENAI_API_KEY) {
      const aiResponse = await context.http.post(
        "https://api.openai.com/v1/chat/completions",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: `Generate a fun, one-line celebration message for a crypto donation of $${usdAmount.toFixed(2)} from "${donorName}" with the message: "${message}". Keep it under 100 characters and make it exciting!`,
              },
            ],
            max_tokens: 50,
            temperature: 0.8,
          }),
        }
      );

      if (aiResponse.status === 200) {
        const aiResult = JSON.parse(aiResponse.body);
        celebrationMessage = aiResult.choices?.[0]?.message?.content?.trim();
        console.log(
          `[DonateLink CRE] Celebration message: ${celebrationMessage}`
        );
      }
    }
  } catch (err) {
    console.error("[DonateLink CRE] Failed to generate celebration:", err);
  }

  // ============================================================
  // Step 4: Read total donations count from on-chain (EVM Read)
  // ============================================================
  try {
    const totalCount = await context.evm.readContract({
      chainId: 84532,
      contractAddress: process.env.DONATELINK_CONTRACT_ADDRESS || "",
      functionName: "totalDonationsCount",
      args: [],
    });
    console.log(
      `[DonateLink CRE] Total on-chain donations count: ${totalCount}`
    );
  } catch (err) {
    console.error("[DonateLink CRE] Failed to read on-chain data:", err);
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log("[DonateLink CRE] Orchestration complete:", {
    donor,
    streamer,
    usdAmount,
    tokenSymbol,
    sourceChain,
    donationId,
    celebrationMessage,
    ethPrice: prices.ethereum?.usd,
    linkPrice: prices.chainlink?.usd,
  });

  return {
    success: true,
    donationId,
    celebrationMessage,
  };
}
