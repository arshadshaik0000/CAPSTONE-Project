import { Configuration, BrowserCacheLocation } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'abc83236-29f6-4d73-bc50-34416f613dce',
    authority: 'https://login.microsoftonline.com/0211cc52-9ffa-4afa-b554-a911af7fc296',
    redirectUri: 'https://localhost:4200/user-login',
    postLogoutRedirectUri: 'https://localhost:4200',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false 
  }
};
