import { Injectable } from '@angular/core';
import { TokensService } from './tokens.service';
import { environment } from '../../environments/environment';
import { removeLeadingZeros } from '../utils/formatting';

import * as d3 from 'd3';
import { timeParse } from "d3-time-format";

@Injectable({
  providedIn: 'root'
})
export class TradesService {

  public trades = {};

  public ethVolume = 0;

  constructor(
    private tokens: TokensService
  ) { }

  evalAirSwapDEXFilledEventLogs(rawTxList: any) {
    /*
    Loop over a list of raw Filled Events and extract the relevant trade data
    in sorted lists
    */
    const trades = [];
    // Step 1: Read all transactions and do some first transformations
    for (const txData of rawTxList) {
      /* from AirSwapDEX contract:
         event Filled(address indexed makerAddress,
           uint makerAmount, address indexed makerToken,
           address takerAddress, uint takerAmount,
           address indexed takerToken, uint256 expiration,
           uint256 nonce);
      */
      const data = txData.data;
      const trade = {
        'hash': txData.transactionHash,
        'makerAddress': removeLeadingZeros(txData.topics['1']),
        'makerAmount': parseInt(data.slice(0, 2 + 64 * 1), 16),
        'makerToken': removeLeadingZeros(txData.topics['2']),
        'takerAddress': removeLeadingZeros('0x' + data.slice(2 + 64 * 1, 2 + 64 * 2)),
        'takerAmount': parseInt('0x' + data.slice(2 + 64 * 2, 2 + 64 * 3), 16),
        'takerToken': removeLeadingZeros(txData.topics['3']),
        'expiration': '0x' + data.slice(2 + 64 * 3, 2 + 64 * 4),
        'nonce': '0x' + data.slice(2 + 64 * 4, 2 + 64 * 5),
        'gasUsed': parseInt(txData.gasUsed, 16),
        'gasPrice': parseInt(txData.gasPrice, 16),
        'timestamp': parseInt(txData.timeStamp, 16),
      };

      if (trade['makerToken'] === environment.wethAddress) {
        trade['makerToken'] = environment.ethAddress;
      }
      if (trade['takerToken'] === environment.wethAddress) {
        trade['takerToken'] = environment.ethAddress;
      }

      trade['gasCost'] = trade.gasPrice * trade.gasUsed / 1e18;

      trades.push(trade);
    }

    /*
    Step 2:
    Once all trades . Add their
    information to the transactions
    */

    const TokenPairList = {};

    for (const trade of trades) {
      const makerProps = this.tokens.tokenByAddress[trade.makerToken];
      const takerProps = this.tokens.tokenByAddress[trade.takerToken];

      // check if maker token has been seen before
      if (!this.tokens.isTokenActive[makerProps.address]) {
        this.tokens.isTokenActive[makerProps.address] = true;
        this.tokens.isTokenPairActive[makerProps.address] = {};
      }
      // check if maker - taker pair has been seen before
      if (!this.tokens.isTokenPairActive[makerProps.address][takerProps.address]) {
        this.tokens.isTokenPairActive[makerProps.address][takerProps.address] = true;
      }
      // check if taker token has been seen before
      if (!this.tokens.isTokenActive[takerProps.name]) {
        this.tokens.isTokenActive[takerProps.address] = true;
        this.tokens.isTokenPairActive[takerProps.address] = {};
      }
      // check if taker - maker pair has been seen before
      if (!this.tokens.isTokenPairActive[takerProps.address][makerProps.address]) {
        this.tokens.isTokenPairActive[takerProps.address][makerProps.address] = true;
      }

      trade['makerSymbol'] = makerProps.symbol;
      trade['takerSymbol'] = takerProps.symbol;

      trade.makerAmount /= 10 ** makerProps.decimals;
      trade.takerAmount /= 10 ** takerProps.decimals;
      trade['price'] = trade.takerAmount / trade.makerAmount;

      if (!this.trades[trade.makerToken]) {
        this.trades[trade.makerToken] = {};
      }

      if (!this.trades[trade.makerToken][trade.takerToken]) {
        this.trades[trade.makerToken][trade.takerToken] = [];
      }
      this.trades[trade.makerToken][trade.takerToken].push(trade);
    }

    this.calculateEthVolume(trades);
  }

  calculateEthVolume(trades) {
    let volume = 0;
    const twentyFourHoursAgo = Date.now() / 1000 - 86400;
    for (const trade of trades) {
      if (trade.timestamp > twentyFourHoursAgo) {
        if (trade.makerSymbol === 'ETH') {
          volume += trade.makerAmount;
        } else if (trade.takerSymbol === 'ETH') {
          volume += trade.takerAmount;
        }
      }
    }
    this.ethVolume = volume;
  }

  getTrades(token1address, token2address) {
    let selectedMarket = [];
    let oppositeMarket = [];
    if (this.trades[token1address] && this.trades[token1address][token2address]) {
      selectedMarket = this.trades[token1address][token2address];
    }
    if (this.trades[token2address] && this.trades[token2address][token1address]) {
      oppositeMarket = this.trades[token2address][token1address];
    }

    for (const tx of selectedMarket) {
      tx['volume'] = tx.makerAmount;
    }
    if (oppositeMarket && oppositeMarket.length > 0) {
      const copyOppositeMarket = oppositeMarket.map(x => Object.assign({}, x));
      for (const tx of copyOppositeMarket) {
        tx.price = 1 / tx.price;
        tx['volume'] = tx.takerAmount;
      }
      selectedMarket = selectedMarket.concat(copyOppositeMarket);
    }
    const sortedCombinedMarkets =
      selectedMarket.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));

    return sortedCombinedMarkets;
  }


  convertToOHLC(data) {
    const copyData = data.map(x => Object.assign({}, x));
    copyData.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));
    const result = [];
    const format = d3.timeFormat('%Y-%m-%d');
    const parseDate = timeParse('%Y-%m-%d');
    copyData.forEach(d => d.timestamp = format(new Date(d.timestamp * 1000)));
    const allDates = [...Array.from(new Set(copyData.map(d => d.timestamp)))];
    allDates.forEach(d => {
      const tempObject = {};
      const filteredData = copyData.filter(e => e.timestamp === d);
      tempObject['date'] = parseDate(d);
      tempObject['volume'] = d3.sum(filteredData, e => e.volume);
      tempObject['open'] = filteredData[0].price;
      tempObject['close'] = filteredData[filteredData.length - 1].price;
      tempObject['high'] = d3.max(filteredData, e => e.price);
      tempObject['low'] = d3.min(filteredData, e => e.price);
      result.push(tempObject);
    });
    result['columns'] = ['date', 'volume', 'open', 'close', 'high', 'low']
    return result;
  }

}
