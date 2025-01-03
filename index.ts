
import type { AssetHolding, AssetWallet, CandleFetcher, Exchange, TickerFetcher } from 'tradeexchanges';
import type { TickerData } from 'tradeexchanges/tradingCandles';


export class Bybit implements TickerFetcher {


    client;
    options;


    constructor(client: any, options: any) {
        this.client = client;
        this.options = options;
    }

    async getTickerSymbols(): Promise<string[]> {
        return [
            'BTCUSDT'
        ];
    }

    getAssetDefaultTickerSymbol(assetSymbol: string) {
        return assetSymbol + 'USDT';
    }

    async getTickerData(symbol: string): Promise<{data: TickerData,fromCache: Boolean} | null> {
        return {
            data: {
                "symbol": "BTC",
                "current": 96942.81,
                "high": 97739.82,
                "low": 95982.19,
                "base_volume": 39750000000,
                "quote_volume": 1919944500581.36,
                "tags": ["store-of-value", "pow", "decentralized"],
                "circulating_supply": 19804918,
                "status": "active",
                "full_data": {
                  "market_cap": 1919944500581.36,
                  "total_supply": 21000000,
                  "last_updated": "2025-01-03T00:00:00Z"
                }
            },
            fromCache: false
        };
    }
}