
import type { AssetHolding, AssetWallet, CandleFetcher, Exchange, TickerFetcher } from 'tradeexchanges';
import type { TickerCandle, TickerData } from 'tradeexchanges/tradingCandles';
import HttpClient, { type ResponseDataWithCache } from 'nonChalantJs';

interface BybitResponse<listFormat> {
    result: {
        list: listFormat
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

type CandleData = [
    string, // timestamp
    string, // openPrice
    string, // highPrice
    string, // lowPrice
    string, // closePrice
    string, // volume
    string  // turnover
];
  
  
  
  
  
  


export class Bybit implements TickerFetcher, CandleFetcher {


    client: HttpClient;
    options;


    constructor(client: HttpClient, options: any) {
        this.client = client;
        this.options = options;
    }

    _getMarketTickers(): Promise<{response: BybitResponse<BybitTickerData[]>, fromCache: boolean}> {
        return this.client.getWithCache(
            'https://api.bybit.com/v5/market/tickers?category=spot'
        ).then(
            (fetchResponse: ResponseDataWithCache) => {
                return {
                    response: fetchResponse.response as BybitResponse<BybitTickerData[]>,
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

    _minutesToInterval(minutes: number): string {
        switch (minutes) {            
            case 1:
            case 3:
            case 5:
            case 15:
            case 30:
            case 60:
            case 120:
            case 180:
            case 240:
            case 360:
            case 720:
                return `${minutes}`
                break;

            case 1440:
                return 'D'
                break;

            case 10080:
                return 'W';
                break;
            case 43200:
                return 'M' 
                break;

            default:
                throw `Unsupported interval: ${minutes}`;
        }
        
    }

    
    fetchCandles(symbol: string, minutes: number, limit: number): Promise<TickerCandle[] | null> {
        return this.client.getNoCache(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${this._minutesToInterval(minutes)}&limit=${limit}`)
            .then(
                (response) => response as BybitResponse<CandleData[]>
            )
            .then(
                (response: BybitResponse<CandleData[]>) => {
                    return response.result.list.map(
                        (exchangeCandle: CandleData) => ({
                            open: parseFloat(exchangeCandle[1]),
                            high: parseFloat(exchangeCandle[2]),
                            low: parseFloat(exchangeCandle[3]),
                            close: parseFloat(exchangeCandle[4]),
                            open_timestamp: parseFloat(exchangeCandle[0]),
                            close_timestamp: parseFloat(exchangeCandle[0]) 
                                + (minutes * 60 * 1000) - 1,
                            base_volume: parseFloat(exchangeCandle[5]),
                            quote_volume: parseFloat(exchangeCandle[6]),
                        })
                    );                    
                }
            )
    }
}