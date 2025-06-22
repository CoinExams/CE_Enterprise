import { ErrorCodeString, ErrorCodes, ErrorResponse, SuccessResponse } from "./types";

const
    errorMsgs: ErrorCodes = {
        unknown: `Unknown error occurred`,
        exchange_id_invalid: `Invalid exchange Id. Please submit a valid exchange Id.`,
        exchange_no_options: `Exchange requested does not have coin options`,
        symbols_insufficient: `Coinset symbols are insufficient`,
        symbol_invalid: `Coinset symbol used is unsupported by this exchange`,
        invalid_coinset_id: `Coinset id is invalid`,
        not_prepaid: `Your API account is not prepaid. Contact us to change account type`,
        invalid_inputs: `Invalid inputs. Please check request payload.`,
        duplicate_payment: `Payment has been already registered previously`,
        invalid_payment: `Payment is invalid or incomplete. Please try again later`,
        no_trades: `Portfolio does not have trades`,
        access_expired: `API access expired. Please contact us.`,
        api_invalid: `User exchange API keys submitted are invalid`,
        api_renew: `User exchange API requires access renewal`,
        max_port_reached: `Portfolios maximum number reached. Contact us to increase your API limit.`,
        port_delete_failed: `Portfolio delete failed. Please try again.`,
        last_port_error: `Account needs at least one portfolio`,
        coinset_backtest_unavailable: `Coinset backtest not available`,
    },
    eRes = (e?: ErrorCodeString): ErrorResponse => {
        e = e || `unknown`;
        return {
            success: false,
            e,
            errorMsg: errorMsgs[e] || e,
        }
    },
    fullRes = (res?: any, data?: any): ErrorResponse | SuccessResponse<any> => {
        const e: ErrorCodeString = res?.e;
        return res?.success ? { success: true, data }
            : eRes(e);
    };

export {
    errorMsgs,
    eRes,
    fullRes,
}