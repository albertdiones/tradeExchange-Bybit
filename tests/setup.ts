import HttpClient from "nonChalantJs";
import { Bybit } from "../index";

import Logger from 'add_logger';
import { PaddedScheduleManager } from "nonChalantJs/scheduleManager";


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
        scheduleManager: new PaddedScheduleManager(500, 0)
    }),
    {
        logger: new Logger('bybit'),
    }
);