import type { TickerCandle } from "tradeexchanges/tradingCandles";
import {exchange} from "./setup";
import {describe, expect, test} from '@jest/globals';

// Alternative source price
async function cryptoPrice(asset: string): Promise<string> {
    return fetch("https://cryptoprices.cc/"+asset+"/").then(
        r => r.text()
    );  
}
  
test('get ICPUSDT candles', async () => {
    const limit = 777;
    const candles: TickerCandle[] | null  = await exchange.fetchCandles('ICPUSDT', 5,limit);
    
    expect(candles).not.toBeNull();
    
    expect(candles?.length).toBe(limit);

    if (candles === null) {
        throw "Candles is null";
    }


    const alternativeSourcePrice = parseFloat(await cryptoPrice('ICP'));

    const currentCandle = candles[0];

    expect(currentCandle.open_timestamp).toBeGreaterThan(candles[776].open_timestamp);
    
    const tolerance = parseFloat(process.env.TEST_PRICE_CHECK_TOLERANCE ?? '0.1');
    const ceilingPrice = alternativeSourcePrice*(1+tolerance);
    const floorPrice = alternativeSourcePrice*(1-tolerance);


    expect(currentCandle.close).toBeGreaterThanOrEqual(floorPrice);
    expect(currentCandle.close).toBeLessThanOrEqual(ceilingPrice);


    const olderCandle = candles[1];

    expect(olderCandle.close_timestamp+1).toBe(currentCandle.open_timestamp);


    expect(candles[2].close_timestamp+1).toBe(olderCandle.open_timestamp);
    
});


test('get XRP 1d candles', async () => {
    const limit = 14;
    const candles: TickerCandle[] | null  = await exchange.fetchCandles('XRPUSDT', 1440,limit);
    
    expect(candles).not.toBeNull();
    
    expect(candles?.length).toBe(limit);
});



test('get XRP 1week candles', async () => {
    const limit = 65;
    const candles: TickerCandle[] | null  = await exchange.fetchCandles('XRPUSDT', 10080,limit);
    
    expect(candles).not.toBeNull();
    
    expect(candles?.length).toBe(limit);

    console.log('oldest candle close', candles[limit-1]);
});