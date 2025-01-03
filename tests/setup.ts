import HttpClient from "nonChalantJs";
import { Bybit } from "../index";

import Logger from 'add_logger';


export class CacheViaNothing {
    async getItem(key: string): Promise<string | null> {
        return null;
    }

    setItem(
        key: string, 
        value: string,
        expirationSeconds: number
    ): void { 
    }
}

export const exchange = new Bybit(
    new HttpClient({
        logger: console,
        cache: new CacheViaNothing(),
        minTimeoutPerRequest: 500,
        maxRandomPreRequestTimeout: 0,
    }),
    {
        logger: new Logger('bybit'),
    }
);