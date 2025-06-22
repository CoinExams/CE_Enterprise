import { createHmac } from 'crypto';
import { APISpecs, CEConfig, ClientPayments, ConfigSDK, ResultPromise } from './types';
import {
    getConfig as getMerchantConfig,
    config as merchantConfig,
} from 'merchantslate';
import { fullRes } from './response';

const
    /** SDK configuration */
    configuration: ConfigSDK = {
        apiKey: ``,
        hmacKey: ``,
        consoleLogEnabled: true,
    },
    /** Get SDK configuration */
    getConfig = (): ConfigSDK => {
        return {
            ...configuration,
            ...getMerchantConfig(),
        }
    },
    /** Configure SDK */
    config = async ({
        apiKey,
        hmacKey,
        payId,
        payChain,
        payRPC,
        consoleLogEnabled,
    }: CEConfig) => {
        if (apiKey) configuration.apiKey = apiKey;
        if (hmacKey) configuration.hmacKey = hmacKey;
        if (payId) configuration.payId = payId;
        if (payChain) {
            configuration.payChain = payChain;
            if (payRPC) merchantConfig({
                ...payChain == `APT` ? { APT_RPC: payRPC } : {},
                ...payChain == `ARBITRUM` ? { ARBITRUM_RPC: payRPC } : {},
                ...payChain == `AVALANCHE` ? { AVALANCHE_RPC: payRPC } : {},
                ...payChain == `BSC` ? { BSC_RPC: payRPC } : {},
                ...payChain == `CELO` ? { CELO_RPC: payRPC } : {},
                ...payChain == `ETH` ? { ETH_RPC: payRPC } : {},
                ...payChain == `FANTOM` ? { FANTOM_RPC: payRPC } : {},
                ...payChain == `OPTIMISM` ? { OPTIMISM_RPC: payRPC } : {},
                ...payChain == `POLYGON` ? { POLYGON_RPC: payRPC } : {},
            });
        };
        if (consoleLogEnabled != undefined) {
            configuration.consoleLogEnabled = consoleLogEnabled;
            merchantConfig({ consoleLogEnabled });
        };
        if (apiKey || hmacKey) await accountInfo();
    },
    /** CoinExams Base API URL  */
    baseURL: string = `https://api.coinexams.com/v1/`,
    /** Invalid Strings Check */
    invalidStr = (params: (string | undefined)[]) => {
        try {
            for (let i = 0; i < params.length; i++) {
                const p = params[i];
                if (!p || typeof p != `string`)
                    return true
            }
            return false
        } catch {
            return true
        };
    },
    /** Log Function Error */
    logErr = (e: any, endPoint?: string) => {
        if (!configuration.consoleLogEnabled) return
        try {
            console.log(endPoint, `CoinExams API error`, e);
        } catch (error) {
            console.log(`CoinExams API error`);
        };
    },
    /** Main Request Function */
    requestFun = async (
        endPoint: string,
        reqParm?: any,
    ) => {
        try {
            const
                body = {
                    key: configuration.apiKey,
                    ...reqParm || {}
                },
                signature = createHmac(`sha256`, configuration.hmacKey)
                    .update(JSON.stringify(body))
                    .digest(`hex`),
                res = await fetch(
                    baseURL + endPoint,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...body,
                            signature
                        })
                    }
                ),
                result = await res?.json();

            // log request error
            if (
                !result?.success
                && result?.e != undefined
                && configuration.consoleLogEnabled
            ) {
                console.log(`error`, result?.e);
            };

            // return results
            return result;
        } catch (e) {
            logErr(e);
            return
        };
    },
    /** Data URL */
    dataURL = `https://srv.coinexams.com/`,
    /** Data Request Function */
    fileData = async ({
        folderPath,
        fileName,
    }: {
        folderPath: string,
        fileName: string,
    }) => {
        try {
            const
                res = await fetch(`${dataURL}${folderPath}/${fileName}.json`),
                result = await res?.json();
            return result;
        } catch (e) {
            logErr(e);
            return
        };
    },
    /** API data */
    accountInfo = async (): ResultPromise<APISpecs> => {
        const
            res = await requestFun(`account/info`),
            data: APISpecs = res?.data,
            payId = data?.payId,
            payChain = data?.payChain;
        if (payId && payChain) config({ payId, payChain });
        return fullRes(res, data);
    },
    /** API payments list */
    accountPayments = async (): ResultPromise<ClientPayments[]> => {
        const
            res = await requestFun(`account/payments`),
            data: ClientPayments[] = res?.payments;
        return fullRes(res, data);
    };

export {
    getConfig,
    config,
    logErr,
    invalidStr,
    requestFun,
    fileData,
    accountInfo,
    accountPayments,
}