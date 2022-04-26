import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgAuthModule, NgAuthService } from '@cg/ng-auth';
import { NgConfigModule, NgConfigService } from '@cg/ng-config';
import { ErrorService } from '@cg/ng-errorhandler';
import { NgLocalizationModule, LocalizationLoader, LocalizationHttpLoader } from '@cg/ng-localization';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BreadcrumbService } from './services/breadcrumb.service';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

const getCoreUrl = (ngConfigService: NgConfigService) => {
  return ngConfigService.get('coreUrl');
};

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new LocalizationHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    UnauthorizedComponent
  ],
  imports: [
    NgConfigModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FlexLayoutModule,
    NgAuthModule,
    NgLocalizationModule.forRoot({
      loader: {
        provide: LocalizationLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    BreadcrumbService,
    ErrorService,
    NgAuthService,
    {
      provide: 'BASE_URL',
      useFactory: getCoreUrl,
      deps: [NgConfigService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
