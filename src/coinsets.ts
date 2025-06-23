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
    CoinSetBackTestObj,
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
    },
    /**
     * Coin Sets :
     * All coin sets created and back-tests
     * */
    coinSetsAllBackTest = async (
        /** exchange Id */
        exchId: ExchIds
    ): ResultPromise<CoinSetBackTestObj> => {
        try {
            const
                res = await coinSetsAll(exchId),
                backTestsObj: CoinSetBackTestObj = {};
            if (res?.success) {
                const
                    allBackTests: ResultPromise<CoinSetBackTestResult>[] = [],
                    data = res.data[exchId],
                    idsArray = Object.keys(data);
                for (let i = 0; i < idsArray.length; i++) {
                    const
                        coinSetId = idsArray[i],
                        list = data[coinSetId];
                    allBackTests.push(coinSetBackTest(list));
                };
                const allBackTestsResults = await Promise.all(allBackTests);
                for (let i = 0; i < idsArray.length; i++) {
                    const
                        coinSetId = idsArray[i],
                        result = allBackTestsResults[i],
                        list = data[coinSetId];
                    backTestsObj[coinSetId] = {
                        list,
                        backtest: result?.success ? result?.data : result?.e
                    };
                };
            };
            return fullRes(res, backTestsObj);
        } catch (e) {
            logErr(e, `coinsets all backtest`);
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
    coinSetsAllBackTest,
};