import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app/app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering() // Solo esto, sin rutas forzadas
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
