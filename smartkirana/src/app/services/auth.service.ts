import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { authState, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth, private router: Router) {
    this.user$ = authState(this.auth);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/login']));
  }

  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      this.user$.subscribe((user) => resolve(!!user));
    });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  sendPasswordReset(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

}
