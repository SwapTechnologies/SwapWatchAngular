import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MarketsComponent } from './components/markets/markets.component';
import { MyTradesComponent } from './components/my-trades/my-trades.component';

import { TradesService } from './services/trades.service';
import { AutoCompleteInputComponent } from './components/auto-complete-input/auto-complete-input.component';

const appRoutes: Routes = [
  { path: '', component: MarketsComponent },
  { path: 'markets', component: MarketsComponent},
  { path: 'myTrades', component: MyTradesComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavbarComponent,
    MarketsComponent,
    MyTradesComponent,
    AutoCompleteInputComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
  ],
  providers: [
    TradesService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
