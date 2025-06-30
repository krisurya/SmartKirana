import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loggedIn = await auth.isLoggedIn();
  if (!loggedIn) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
