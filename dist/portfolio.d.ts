import { PortfolioExchAPI, PortSettings, ExchDataAll, ExchDataAllPrices, PortSettingsAll, PortfolioUpdate, PortfolioExchAPIReturn, ResultPromise, PortfolioCoinSetTradingData } from "./types";
declare const 
/**
 * Portfolios Settings :
 * Latest settings for all portfolios
 * or pass a single portfolio portfolio Id portId for specific data
 * @returns empty object when no portfolios
 * */
portfolioData: (portId?: string) => ResultPromise<PortSettingsAll>, 
/**
 * Portfolios Trades :
 * Latest trades for all portfolios
 * or pass a single portfolio portfolio Id portId for specific data
 * @returns empty object when no trades
 * */
portfolioTrades: (portId?: string) => ResultPromise<ExchDataAll>, 
/**
 * Portfolio Trades Prices :
 * Latest trades for all portfolios with all coin prices
 * or pass a single portfolio portfolio Id portId for specific data
 * @returns empty object when no trades
 * */
portfolioTradesPrices: ({ portId, currencyISO, }: {
    portId?: string;
    currencyISO: string;
}) => ResultPromise<ExchDataAllPrices>, 
/**
 * Portfolio Trading Totals :
 * Trading totals per portfolio based on coinSet used
 * @returns object portId keyed with totals
 * */
portfolioTradingTotals: ({ portId, currencyISO, }: {
    portId?: string;
    currencyISO: string;
}) => ResultPromise<PortfolioCoinSetTradingData>, 
/**
 * Portfolio New :
 * Create a new portfolio and get portfolio ID
 * @returns new portfolio id string
 * */
portfolioNew: (portSettings?: PortSettings) => ResultPromise<string>, 
/**
 * Portfolio Update :
 * Update an existing portfolio using portfolio ID
 * @returns portfolio id string
 * */
portfolioUpdate: ({ portId, portSettings, }: PortfolioUpdate) => ResultPromise<string>, 
/**
 * Portfolio Exchange APIs :
 * Add or update exchange API keys for a given exchange
 * @returns portfolio id string and holdings on exchange
 * */
portfolioExchAPI: ({ portId, exchId, key1, key2, }: PortfolioExchAPI) => ResultPromise<PortfolioExchAPIReturn>, 
/**
 * Portfolio Delete :
 * Delete an existing portfolio using portfolio ID
 * @returns portfolio id string
 * */
portfolioDelete: (portId: string) => ResultPromise<string>;
export { portfolioData, portfolioTrades, portfolioTradesPrices, portfolioTradingTotals, portfolioNew, portfolioUpdate, portfolioExchAPI, portfolioDelete, };
