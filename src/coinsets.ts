import {
    requestFun,
    invalidStr,
    logErr,
    fileData,
} from "./config";
import { eRes, fullRes } from "./response";
import {
    CoinsetDelete,
    CoinsetsData,
    CoinsetUpdate,
    CoinsetNew,
    ExchIds,
    CoinsetId,
    ResultPromise,
    CoinSetBackTestResult,
} from "./types";

const

    /**
     * Coin Sets :
     * All coin sets created
     * */
    coinSetsAll = async (
        /** exchange Id */
        exchId?: ExchIds
    ): ResultPromise<CoinsetsData> => {
        const endPoint = `coinsets/all`;
        try {
            const res = await requestFun(
                endPoint,
                invalidStr([exchId]) ?
                    undefined : { exchId }
            );
            return fullRes(res, res?.coinSets);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Coin Sets Options :
     * Get a list of all possible token symbols
     * */
    coinSetsOptions = async (
        /** exchange Id */
        exchId: ExchIds
    ): ResultPromise<string[]> => {
        const endPoint = `coinsets/options`;
        try {
            if (invalidStr([exchId]))
                return eRes(`invalid_inputs`);

            const res = await requestFun(
                endPoint,
                { exchId }
            );
            return fullRes(res, res?.options || []);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Coin Sets New :
     * Create a new coin set and get coin set ID
     * */
    coinSetsNew = async ({
        exchId,
        coinSet,
    }: CoinsetNew): ResultPromise<string> => {
        const endPoint = `coinsets/add`;
        try {

            if (coinSet?.length < 2)
                return eRes(`symbols_insufficient`);

            if (invalidStr(
                [exchId?.toString()]
                    ?.concat(coinSet)
            )) {
                return eRes(`invalid_inputs`);
            };

            const res = await requestFun(
                endPoint,
                { exchId, coinSet }
            );
            return fullRes(res, res?.coinSetId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Coin Sets Update :
     * Update an existing coin set using coin set ID
     * */
    coinSetsUpdate = async ({
        exchId,
        coinSetId,
        coinSet,
    }: CoinsetUpdate): ResultPromise<string> => {
        const endPoint = `coinsets/update`;
        try {

            if (coinSet?.length < 2)
                return eRes(`symbols_insufficient`);

            if (invalidStr(
                [coinSetId, exchId?.toString()]
                    ?.concat(coinSet)
            )) {
                return eRes(`invalid_inputs`);
            };

            const res: CoinsetId = await requestFun(
                endPoint,
                { coinSetId, exchId, coinSet }
            );
            return fullRes(res, res?.coinSetId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
    * Coin Sets Delete :
    * Delete an existing coin set using coin set ID
    * */
    coinSetsDelete = async ({
        exchId,
        coinSetId,
    }: CoinsetDelete): ResultPromise<string> => {
        const endPoint = `coinsets/delete`;
        try {

            if (invalidStr([coinSetId, exchId?.toString()]))
                return eRes(`invalid_inputs`);

            const res: CoinsetId = await requestFun(
                endPoint,
                { exchId, coinSetId }
            );
            return fullRes(res, res?.coinSetId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },
    /** Coin Set BackTest */
    coinSetBackTest = async (
        coinSet: string[]
    ): ResultPromise<CoinSetBackTestResult> => {
        try {
            const
                coinsetStr = coinSet?.sort()?.join(`,`)?.toUpperCase(),
                result: CoinSetBackTestResult = await fileData({
                    folderPath: `coinsets`,
                    fileName: coinsetStr
                }),
                res = result?.gainRate ? {
                    success: true,
                } : {
                    e: `coinset_backtest_unavailable`,
                };
            return fullRes(res, result);
        } catch (e) {
            logErr(e, `coinsets/backtest`);
            return eRes();
        };
    };

export {
    coinSetsAll,
    coinSetsOptions,
    coinSetsNew,
    coinSetsUpdate,
    coinSetsDelete,
    coinSetBackTest,
};