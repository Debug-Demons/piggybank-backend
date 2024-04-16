// Importing necessary modules using ES6 import syntax
import alpaca from './alpacaAPI.js';


function calculateRoundUp(purchaseAmount) {
    return Math.ceil(purchaseAmount) - purchaseAmount;
  }

  export async function handleTransaction(req, res) {
    // Input validation
    if (!req.body.purchaseAmount || isNaN(req.body.purchaseAmount)) {
      return res.status(400).json({ success: false, error: "Invalid or missing purchase amount." });
    }
  
    const { purchaseAmount } = req.body;
    const roundUpAmount = calculateRoundUp(purchaseAmount);
  
    // Check if roundUpAmount is too small to process
    if (roundUpAmount < 0.01) {  // Assuming $0.01 is the minimum amount Alpaca can process
      return res.status(400).json({ success: false, error: "Round-up amount is too small to invest." });
    }
  
    try {
      const result = await placeOrder('AAPL', roundUpAmount, 'buy');
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(`Transaction failed: ${error.message}`);
      res.status(500).json({ success: false, error: "Failed to process transaction due to an internal error." });
    }
  };

// This function places a market order with the given symbol, dollar amount, and side (buy/sell).
export async function placeOrder(symbol, amount, side) {
    try {
      // Creating an order using the Alpaca API for fractional shares
      const order = await alpaca.createOrder({
        symbol,
        notional: amount,  // specifying the dollar amount to invest
        side,
        type: 'market',
        time_in_force: 'gtc' // 'gtc' stands for 'Good Till Cancelled'
      });
      return order;
    } catch (error) {
      // Logging the error to the console and rethrowing it to be caught by the calling function
      console.error(`Order failed: ${error.message}`);
      throw error;
    }
  };