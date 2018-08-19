import { Component, OnInit } from '@angular/core';
import { TradesService } from '../../services/trades.service';
import { TokensService } from '../../services/tokens.service';
@Component({
  selector: 'app-markets',
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.scss']
})
export class MarketsComponent implements OnInit {

  public ohlcData;
  public marketData;

  public hasLoadedData;

  public selectedToken1;
  public selectedToken2;

  constructor(
    public trades: TradesService,
    public tokens: TokensService
  ) { }

  ngOnInit() {
  }

  updateCurrentTokenData = (token1address, token2address) => {

    if (this.trades.trades
    && ((this.trades.trades[token1address] && this.trades.trades[token1address][token2address])
      || (this.trades.trades[token2address] && this.trades.trades[token2address][token1address]))
    ) {
      const combinedMarket = this.trades.getTrades(token1address, token2address);
      const ohlcData = this.trades.convertToOHLC(combinedMarket);

      if (ohlcData.length === 1) {
        // little patchwork: if only a single data point, the candlestick
        // chart doesn't plot... so that point is just doubled in this case
        ohlcData.push(ohlcData[0]);
      }

      this.ohlcData = ohlcData;
      this.marketData = combinedMarket;
    }
  }

  handleToken1Selected = (selectedToken) => {
    this.selectedToken1 = selectedToken;
    // this.setState({
    //   txList: null,
    //   selectedToken1: selectedToken
    // }, () => {
    //   if (this.state.selectedToken1 && this.state.selectedToken2) this.getTokenPairTxList();
    //   this.checkStatus();
    // })
  }

  handleToken2Selected = (selectedToken) => {
    // if (!selectedToken) {
    //   this.txList = null;
    // }
    this.selectedToken2 = selectedToken;

    // this.setState({
    //   txList: null,
    //   selectedToken2: selectedToken
    // }, () => {
    //   if (this.state.selectedToken1 && this.state.selectedToken2) this.getTokenPairTxList();
    //   this.checkStatus();
    // })
  }

  // handleViewChange = name => event => {
  //   this.setState({ [name]: event.target.checked });
  // };


  // componentWillMount() {
  //   AirSwapContract.getLogs()
  //     .then(x => {
  //       this.evalAirSwapDEXFilledEventLogs(x);
  //       // this.handleToken1Selected(data[0]);
  //       // this.handleToken2Selected(data[1]);
  //     });
  //   this.checkStatus();
  // }

  // checkStatus() {
  //   let statusMsg;
  //   let hasLoadedData = true;
  //   if (!this.state.pairedTx) {
  //     statusMsg = 'Standby. Fetching AirSwap transactions from Etherscan...';
  //     hasLoadedData = false;
  //   } else if (!this.state.txList) {
  //     if (this.state.selectedToken1 && this.state.selectedToken2) {
  //       statusMsg = 'No data found for the selected token pair';
  //     } else {
  //       statusMsg = null//'Please select a token pair';
  //     }
  //   }
  //   this.setState({
  //     hasLoadedData: hasLoadedData,
  //     statusMessage: statusMsg
  //   });
  // }

  // toggleIndicator(ind) {
  //   if (ind) {
  //     var newIndicator = this.state.indicator;
  //     newIndicator[ind] = !newIndicator[ind]
  //     this.setState({
  //       indicator: newIndicator
  //     })
  //   }
  // }

  // toggleViewElement(state) {
  //   this.setState({
  //     viewElement: state
  //   })
  // }

  getToken1List() {
    return this.tokens.tokenList;
    // if (this.state.TokenPairList &&
    //   this.state.selectedToken2 &&
    //   this.state.TokenPairList[this.state.selectedToken2.name])
    //   return this.state.TokenPairList[this.state.selectedToken2.name];
    // else
    //   return this.state.TokenList;
  }

  getToken2List() {
    return this.tokens.tokenList;
    // if (this.trades.trades
    // && this.selectedToken1
    // && this.TokenPairList[this.selectedToken1.name]) {
    //   return this.TokenPairList[this.selectedToken1.name];
    // } else {
    // }
  }

  // buy = () => {
  //   window.AirSwap.Trader.render({
  //     env: 'production',
  //     mode: 'buy',
  //     token: this.state.selectedToken1.address,
  //     amount: 50000,
  //     onCancel: function () {
  //       console.info('Trade was canceled.');
  //     },
  //     onComplete: function (transactionId) {
  //       console.info('Trade complete. Thank you, come again.');
  //     }
  //   }, 'body');
  // }

  // sell = () => {
  //   window.AirSwap.Trader.render({
  //     env: 'production',
  //     mode: 'sell',
  //     token: this.state.selectedToken1.address,
  //     onCancel: function () {
  //       console.info('Trade was canceled.');
  //     },
  //     onComplete: function (transactionId) {
  //       console.info('Trade complete. Thank you, come again.');
  //     }
  //   }, 'body');
  // }
}
