// src/api/alpacaAPI.js
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId: 'PKDA130L58I9I91IP21B',
  secretKey: 'FM5rIl5Dr8Tp1WTl17Ebz2d92LlGbaUymqhdabeu',
  paper: true,
  usePolygon: false
});


// Function to get account information
export const getAccount = async () => {
  try {
    const account = await alpaca.getAccount();
    return account;
  } catch (error) {
    console.error('Error getting account information:', error);
    throw error;
  }
};

// Function to get a list of assets
export const getAssets = async (status = 'active', assetClass = 'us_equity') => {
  try {
    const assets = await alpaca.getAssets({
      status,
      asset_class: assetClass
    });
    return assets;
  } catch (error) {
    console.error('Error getting assets:', error);
    throw error;
  }
};

// Function to get asset by symbol
export const getAsset = async (symbol) => {
  try {
    const asset = await alpaca.getAsset(symbol);
    return asset;
  } catch (error) {
    console.error('Error getting asset:', error);
    throw error;
  }
};

// Function to invest a given amount into AAPL, GOOGL, and MSFT
export const investInTechGiants = async (amount) => {
    const stocks = ['AAPL', 'GOOG', 'MSFT']; // Hardcoded stock symbols
    const amountPerStock = (amount / stocks.length).toFixed(2); // Calculate the amount to invest in each stock
  
    console.log(amountPerStock);

    if (parseFloat(amountPerStock) < 0.01) {
      throw new Error("Amount per stock is too small to invest, increase total amount or reduce number of stocks.");
    }
  
    const orders = [];
  
    for (const stock of stocks) {
      try {
        const order = await alpaca.createOrder({
          symbol: stock,
          notional: amountPerStock,
          side: 'buy',
          type: 'market',
          time_in_force: 'day'
        });
        orders.push(order);
      } catch (error) {
        console.error(`Failed to place order for ${stock}: ${error.message}`);
        // Optionally continue to attempt other orders or handle as a complete transaction failure
        // throw error; // Consider whether to halt on failure or just log the error
      }
    }
  
    return orders; // Returns the details of the orders placed
  };
/*
  createOrder({
    symbol: string, // any valid ticker symbol
    qty: number,
    notional: number, // qty or notional required, not both
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop',
    time_in_force: 'day' | 'gtc' | 'opg' | 'ioc',
    }); => Promise<Order>
*/
   export default alpaca;
//api key = CKJ6I2LBGFWNSAPENXXQ
//api secret = iFIVLOjhDFu6DD5BAjlkpvmH3vWYlelTb6aQlNme
