import { EVMAddress, PayTxsData, Payment } from "@merchantslate/legacy";
import { ResultPromise } from "./types";
declare const 
/** Payment for Portfolio */
payPortfolio: (quantity?: string) => ResultPromise<PayTxsData>, 
/** Payment Validation */
payPortfolioValid: (payingWallet: EVMAddress) => ResultPromise<Payment>, 
/**
* Portfolio payment done :
* Add time to portfolio
* @returns
* */
payDone: (payingWallet: string, portId: string) => ResultPromise<number>;
export { payPortfolio, payPortfolioValid, payDone, };
