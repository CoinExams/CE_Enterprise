import { CoinsetDelete, CoinsetUpdate, CoinsetNew, ExchIds, ResultPromise, CoinSetBackTestResult, CoinSetBackTestObj, CoinsetObj } from "./types";
declare const 
/**
 * Coin Sets :
 * All coin sets created
 * */
coinSetsAll: (exchId?: ExchIds) => ResultPromise<CoinsetObj>, 
/**
 * Coin Sets Options :
 * Get a list of all possible token symbols
 * */
coinSetsOptions: (exchId: ExchIds) => ResultPromise<string[]>, 
/**
 * Coin Sets New :
 * Create a new coin set and get coin set ID
 * */
coinSetsNew: ({ exchId, coinSet, }: CoinsetNew) => ResultPromise<string>, 
/**
 * Coin Sets Update :
 * Update an existing coin set using coin set ID
 * */
coinSetsUpdate: ({ exchId, coinSetId, coinSet, }: CoinsetUpdate) => ResultPromise<string>, 
/**
* Coin Sets Delete :
* Delete an existing coin set using coin set ID
* */
coinSetsDelete: ({ exchId, coinSetId, }: CoinsetDelete) => ResultPromise<string>, 
/** Coin Set BackTest */
coinSetBackTest: (coinSet: string[]) => ResultPromise<CoinSetBackTestResult>, 
/**
 * Coin Sets :
 * All coin sets created and back-tests
 * */
coinSetsAllBackTest: (exchId: ExchIds) => ResultPromise<CoinSetBackTestObj>;
export { coinSetsAll, coinSetsOptions, coinSetsNew, coinSetsUpdate, coinSetsDelete, coinSetBackTest, coinSetsAllBackTest, };
