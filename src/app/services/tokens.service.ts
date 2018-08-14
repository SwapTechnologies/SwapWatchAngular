import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Token } from '../types/token';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  public tokenByAddress = {};

  public tokenByName = {};
  public tokenBySymbol = {};
  public tokenList = [];

  public isTokenActive = {};
  public isTokenPairActive = {};

  constructor(
    private http: HttpClient,
  ) {
    if (Object.keys(this.tokenByAddress).length === 0
    && this.tokenByAddress.constructor === Object ) {
      this.getTokenMetadata();
    }
  }

  getTokenMetadata() {
    this.http.get(environment.tokenMetadata)
    .toPromise()
    .then((result) => {
      this.tokenByAddress = {};
      for (const entry in result) {
        if (result[entry]) {
          const token = result[entry];
          this.tokenByAddress[token.address] = {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: Number(token.decimals),
            logo: token.cmc_img_url
          };
        }
      }
      this.generateTokenLists();
    });
  }

  generateTokenLists() {
    this.tokenByName = {};
    this.tokenBySymbol = {};
    this.tokenList = [];
    for (const tokenAddress in this.tokenByAddress) {
      if (this.tokenByAddress[tokenAddress]) {
        const token = this.tokenByAddress[tokenAddress];
        this.tokenByName[token.name.toLowerCase()] = token;
        this.tokenBySymbol[token.symbol.toLowerCase()] = token;
        this.tokenList.push(token);
      }
    }
    // sort tokenList
    this.tokenList.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  getToken(address: string): Token {
    const validToken = this.tokenByAddress[address];
    if (validToken) {
      return validToken;
    } else {
      return null;
    }
  }

  getTokenByName(name: string): Token {
    let validToken = this.tokenByName[name.toLowerCase()];
    if (!validToken) {
      validToken = this.tokenBySymbol[name.toLowerCase()];
    }
    if (validToken) {
      return validToken;
    } else {
      return null;
    }
  }
}
