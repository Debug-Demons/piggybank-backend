// src/api/alpacaAPI.js
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId: 'CKJ6I2LBGFWNSAPENXXQ',
  secretKey: 'iFIVLOjhDFu6DD5BAjlkpvmH3vWYlelTb6aQlNme',
  paper: true,
});

export default alpaca;
//api key = CKJ6I2LBGFWNSAPENXXQ
//api secret = iFIVLOjhDFu6DD5BAjlkpvmH3vWYlelTb6aQlNme