// gestao-front/src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // Provê as animações do Angular Material
    provideAnimations(), 

    // Provê o HttpClient e registra o interceptor de autenticação.
    // Esta é agora a ÚNICA fonte de configuração para o HttpClient.
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ]
};