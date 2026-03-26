/**
 * Bitkub Exchange Adapter
 * Purpose: Handle communication with Bitkub API.
 */

export interface TickerResponse {
  last: number;
  lowestAsk: number;
  highestBid: number;
  percentChange: number;
  baseVolume: number;
  quoteVolume: number;
  isFrozen: number;
  high24hr: number;
  low24hr: number;
}

export interface BalanceResponse {
  error: number;
  result: {
    [asset: string]: {
      available: number;
      reserved: number;
    };
  };
}

export class BitkubAdapter {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(apiKey: string = "", apiSecret: string = "", baseUrl: string = "https://api.bitkub.com") {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl || "https://api.bitkub.com";
    console.log(`BitkubAdapter initialized with baseUrl: ${this.baseUrl}`);
  }

  updateConfig(apiKey: string, apiSecret: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl || "https://api.bitkub.com";
    console.log(`BitkubAdapter config updated with baseUrl: ${this.baseUrl}`);
  }

  /**
   * Public: Get market ticker
   */
  async getTicker(symbol: string = "THB_USDT"): Promise<TickerResponse | null> {
    try {
      // Use the "all tickers" endpoint as it's often more reliable than the filtered one
      const cleanBaseUrl = this.baseUrl.replace(/\/$/, "");
      const url = `${cleanBaseUrl}/api/market/ticker`;
      
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      
      const data = await res.json();
      
      // If Bitkub returns an error or the symbol is missing, try with the sym parameter as a fallback
      if (data.error || !data[symbol]) {
        if (data.error) {
          console.warn(`Bitkub API returned error ${data.error} for all tickers. Attempting specific symbol ${symbol}.`);
        }
        
        const specificUrl = `${cleanBaseUrl}/api/market/ticker?sym=${symbol}`;
        const specificRes = await fetch(specificUrl, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        const specificData = await specificRes.json();
        
        if (specificData[symbol]) {
          return specificData[symbol];
        }
        
        console.error(`Bitkub ticker for ${symbol} not found in any response.`, { all: data, specific: specificData });
        return null;
      }
      
      return data[symbol];
    } catch (err) {
      console.error("Bitkub getTicker exception:", err);
      return null;
    }
  }

  /**
   * Private: Get account balance
   * Note: Requires signature implementation in production
   */
  async getBalance(): Promise<BalanceResponse | null> {
    if (!this.apiKey || !this.apiSecret) return null;
    
    // In production, implement HMAC-SHA256 signature here
    // const timestamp = Date.now();
    // const sig = this.generateSignature(payload, this.apiSecret);
    
    return null; // Placeholder for MVP
  }

  /**
   * Private: Create Order
   */
  async createOrder(params: any) {
    // Implementation for order execution
    console.log("Bitkub createOrder called with:", params);
    return null;
  }

  private generateSignature(payload: string, secret: string): string {
    // Production: Use crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return "";
  }
}

export const bitkub = new BitkubAdapter(
  process.env.BITKUB_API_KEY,
  process.env.BITKUB_API_SECRET,
  process.env.BITKUB_API_BASE_URL
);
