import {
    invalidStr,
    logErr,
    requestFun,
    fileData,
} from "./config";
import { eRes, fullRes } from "./response";
import {
    NumberObj,
    PortfolioExchAPI,
    PortSettings,
    ExchDataAll,
    ExchDataAllPrices,
    PortSettingsAll,
    PortSettingsAllString,
    PortfolioUpdate,
    PortfolioExchAPIReturn,
    PortfolioId,
    ResultPromise,
    ServerResponseData,
} from "./types";

const

    /** 
     * Portfolios Settings :
     * Latest settings for all portfolios
     * or pass a single portfolio portfolio Id portId for specific data
     * @returns empty object when no portfolios
     * */
    portfolioData = async (
        /** Portfolio Id (optional) */
        portId?: string
    ): ResultPromise<PortSettingsAll> => {
        const endPoint = `portfolios/all`;
        try {
            const
                res = await requestFun(
                    endPoint,
                    invalidStr([portId]) ? undefined
                        : { portId }
                ),
                usersRaw: PortSettingsAllString = res?.users;

            if (!usersRaw)
                return eRes(res?.e);

            const data: PortSettingsAll = {};
            for (const portId in usersRaw)
                data[portId] = JSON.parse(usersRaw[portId])
            return fullRes(res, data);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolios Trades :
     * Latest trades for all portfolios
     * or pass a single portfolio portfolio Id portId for specific data
     * @returns empty object when no trades
     * */
    portfolioTrades = async (
        /** Portfolio Id (optional) */
        portId?: string
    ): ResultPromise<ExchDataAll> => {
        const endPoint = `portfolios/trades`;
        try {
            const res = await requestFun(
                endPoint,
                invalidStr([portId]) ? undefined
                    : { portId }
            );
            return fullRes(res, res?.exchanges)
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Trades Prices :
     * Latest trades for all portfolios with all coin prices
     * or pass a single portfolio portfolio Id portId for specific data
     * @returns empty object when no trades
     * */
    portfolioTradesPrices = async ({
        portId,
        currencyISO,
    }: {
        portId?: string,
        currencyISO: string,
    }): ResultPromise<ExchDataAllPrices> => {
        const endPoint = `data`;
        try {
            const
                tradesRes = await portfolioTrades(portId),
                srvData: ServerResponseData = await fileData({
                    folderPath: ``,
                    fileName: `data`,
                    msInterval: 2e3,
                });

            if (!tradesRes?.success) return eRes(tradesRes?.e);
            if (!srvData?.coins) return eRes(`prices_unavailable`);

            const
                prices: NumberObj = {},
                currencyRate = srvData?.rates?.current?.[currencyISO];
            if (!currencyRate) return eRes(`currency_not_supported`);

            for (const sy in srvData.coins)
                prices[sy] = srvData.coins[sy].pr * currencyRate;

            return {
                success: true,
                data: {
                    data: tradesRes.data,
                    prices,
                },
            };
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio New :
     * Create a new portfolio and get portfolio ID
     * @returns new portfolio id string
     * */
    portfolioNew = async (
        /** Portfolio Settings (optional) */
        portSettings?: PortSettings
    ): ResultPromise<string> => {
        const endPoint = `portfolios/add`;
        try {
            const
                settings = !portSettings ? undefined
                    : JSON.stringify(portSettings),
                res: PortfolioId = await requestFun(
                    endPoint,
                    invalidStr([settings]) ? undefined
                        : { settings }
                );
            return fullRes(res, res?.portId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Update :
     * Update an existing portfolio using portfolio ID
     * @returns portfolio id string
     * */
    portfolioUpdate = async ({
        portId,
        portSettings,
    }: PortfolioUpdate): ResultPromise<string> => {
        const endPoint = `portfolios/update`;
        try {

            const settings = !portSettings ? undefined
                : JSON.stringify(portSettings);

            if (invalidStr([portId, settings]))
                return eRes(`invalid_inputs`);

            const res: PortfolioId = await requestFun(
                endPoint,
                {
                    portId,
                    settings
                }
            );
            return fullRes(res, res?.portId)
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Exchange APIs :
     * Add or update exchange API keys for a given exchange
     * @returns portfolio id string and holdings on exchange
     * */
    portfolioExchAPI = async ({
        portId,
        exchId,
        key1,
        key2,
    }: PortfolioExchAPI): ResultPromise<PortfolioExchAPIReturn> => {
        const endPoint = `portfolios/api`;
        try {

            if (invalidStr([key1, key2]))
                return eRes(`api_invalid`);

            if (invalidStr([portId, exchId]))
                return eRes(`invalid_inputs`);

            const
                res: PortfolioExchAPIReturn =
                    await requestFun(
                        endPoint,
                        {
                            portId,
                            exchId,
                            k1: key1,
                            k2: key2
                        }
                    ),
                data: PortfolioExchAPIReturn = {
                    portId: res?.portId,
                    holdings: res?.holdings,
                    keyIds: res?.keyIds,
                };
            return fullRes(res, data);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    },

    /**
     * Portfolio Delete :
     * Delete an existing portfolio using portfolio ID
     * @returns portfolio id string
     * */
    portfolioDelete = async (
        /** Portfolio Id */
        portId: string,
    ): ResultPromise<string> => {
        const endPoint = `portfolios/delete`;
        try {
            const res: PortfolioId = invalidStr([portId]) ? undefined
                : await requestFun(
                    endPoint,
                    { portId }
                );
            return fullRes(res, res?.portId);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    };

export {
    portfolioData,
    portfolioTrades,
    portfolioTradesPrices,
    portfolioNew,
    portfolioUpdate,
    portfolioExchAPI,
    portfolioDelete,
};