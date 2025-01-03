
import type { AssetHolding, AssetWallet, CandleFetcher, Exchange, TickerFetcher } from 'tradeexchanges';
import type { TickerData } from 'tradeexchanges/tradingCandles';
import HttpClient, { type ResponseDataWithCache } from 'nonChalantJs';

interface BybitResponse {
    result: {
        list: BybitTickerData[]
    }
}

interface BybitTickerData {
    symbol: string;
    bid1Price: string;
    bid1Size: string;
    ask1Price: string;
    ask1Size: string;
    lastPrice: string;
    prevPrice24h: string;
    price24hPcnt: string;
    highPrice24h: string;
    lowPrice24h: string;
    turnover24h: string;
    volume24h: string;
}


export class Bybit implements TickerFetcher {


    client: HttpClient;
    options;


    constructor(client: HttpClient, options: any) {
        this.client = client;
        this.options = options;
    }

    _getMarketTickers(): Promise<{response: BybitResponse, fromCache: boolean}> {
        return this.client.getWithCache(
            'https://api.bybit.com/v5/market/tickers?category=spot'
        ).then(
            (fetchResponse: ResponseDataWithCache) => {
                return {
                    response: fetchResponse.response as BybitResponse,
                    fromCache: fetchResponse.fromCache
                }
            }
        );
    }

    async getTickerSymbols(): Promise<string[]> {
        return this._getMarketTickers().then(
            ({response}) => {
                return response.result.list.map(
                    (ticker: {symbol: string }) => ticker.symbol
                )
            }
        );
    }

    getAssetDefaultTickerSymbol(assetSymbol: string): string {
        return assetSymbol + 'USDT';
    }

    async getTickerData(symbol: string): Promise<{data: TickerData,fromCache: Boolean} | null> {
        
        return this._getMarketTickers().then(
                ({response}) => {
                    return {
                        data: response.result.list.filter(
                            (ticker: {symbol: string }) => ticker.symbol === symbol
                        )?.map(
                            (ticker): TickerData => ({
                                symbol: ticker.symbol,
                                current: parseFloat(ticker.lastPrice),
                                high: parseFloat(ticker.highPrice24h),
                                low: parseFloat(ticker.lowPrice24h),
                                base_volume: parseFloat(ticker.volume24h),
                                quote_volume: parseFloat(ticker.volume24h)*parseFloat(ticker.lastPrice),
                                full_data: ticker
                            })
                        )[0],
                        fromCache: false
                    }
                }
            );
    }
}