const OKX_DEX_QUOTE_URL = 'https://www.okx.com/api/v1/dex/aggregator/quote';

export async function getSwapQuote({ fromToken, toToken, amount, chainId = 195 }) {
  const params = new URLSearchParams({
    fromToken: fromToken,
    toToken: toToken,
    amount: amount,
    chainId: String(chainId),
    slippage: '0.5',
  });

  try {
    const response = await fetch(`${OKX_DEX_QUOTE_URL}?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OKX DEX quote failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error('[Swap] Quote service error:', err.message);
    throw err;
  }
}
