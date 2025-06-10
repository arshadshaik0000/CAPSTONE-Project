// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule
} from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// 🔐 MSAL (Microsoft Login)
import {
  MsalModule,
  MsalInterceptor,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptorConfiguration,
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  BrowserCacheLocation,
  InteractionType,
  AuthenticationResult
} from '@azure/msal-browser';

// ✅ Custom JWT Interceptor
import { AuthInterceptor } from './app/services/auth.interceptor';

// ✅ MSAL Config
import { msalConfig } from './app/auth/msal/msal.config';

// ✅ MSAL Instance Factory
export function MSALInstanceFactory() {
  return new PublicClientApplication(msalConfig);
}

// ✅ MSAL Interceptor Config Factory
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap: new Map<string, string[]>(),
  };
}

// ✅ Bootstrap Application
async function main() {
  const msalInstance = MSALInstanceFactory();

  // 🟢 First initialize MSAL
  await msalInstance.initialize();

  // 🧠 Handle Redirect if loginRedirect() was triggered
  await msalInstance
    .handleRedirectPromise()
    .then((result: AuthenticationResult | null) => {
      if (result?.account) {
        msalInstance.setActiveAccount(result.account);
        console.log('✅ Redirect login successful:', result.account.username);
      } else {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }
      }
    })
    .catch((error) => {
      console.error('❌ MSAL Redirect Error:', error);
    });

  // 🚀 Launch Angular App
  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideAnimations(),
      provideToastr(),

      importProvidersFrom(HttpClientModule, MsalModule),

      { provide: MSAL_INSTANCE, useValue: msalInstance },
      { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },

      { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

      MsalService,
      MsalBroadcastService
    ]
  }).catch(err => console.error(err));
}

main();
