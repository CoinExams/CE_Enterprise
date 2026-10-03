import { EVMAddress, payValidation, payTxs, PayTxsData, Payment } from "@merchantslate/legacy";
import { getConfig, invalidStr, logErr, requestFun } from "./config";
import { ResultPromise } from "./types";
import { eRes, fullRes } from "./response";

const 
    /** Payment for Portfolio */
    payPortfolio = async (
        quantity: string = `1`
    ): ResultPromise<PayTxsData> => {
        const
            data = getConfig(),
            payChain = data?.payChain,
            payId = data?.payId;

        if (!payChain || !payId)
            return eRes(`not_prepaid`);

        const res = await payTxs(payChain, payId, quantity);
        return res?.success ? fullRes(res, res?.data)
            : eRes();
    },
    /** Payment Validation */
    payPortfolioValid = async (
        payingWallet: EVMAddress
    ): ResultPromise<Payment> => {
        const
            data = getConfig(),
            payChain = data?.payChain,
            payId = data?.payId;

        if (!payChain || !payId)
            return eRes(`not_prepaid`);

        const res = await payValidation({
            chain: payChain,
            productId: payId,
            walletAddress: payingWallet,
        });
        return res?.success ? fullRes(res, res?.data)
            : eRes();
    },

    /**
    * Portfolio payment done :
    * Add time to portfolio
    * @returns 
    * */
    payDone = async (
        /** User wallet address (for payment validation) */
        payingWallet: string,
        /** Portfolio Id */
        portId: string
    ): ResultPromise<number> => {
        const endPoint = `portfolios/pay`;
        try {

            if (invalidStr([portId, payingWallet]))
                return eRes(`invalid_inputs`);

            const res = await requestFun(
                endPoint,
                {
                    portId,
                    payingWallet
                }
            );
            return fullRes(res, res?.paid);
        } catch (e) {
            logErr(e, endPoint);
            return eRes();
        };
    };

export {
    payPortfolio,
    payPortfolioValid,
    payDone,
};