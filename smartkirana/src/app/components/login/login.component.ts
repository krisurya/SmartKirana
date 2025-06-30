import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Adjust path
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    InputTextModule,
    ButtonModule,
    CardModule,
    CheckboxModule, 
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  rememberMe = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(){
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail });
      this.rememberMe = true;
    }
  }

  async login() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      await this.auth.login(email, password);
      this.router.navigate(['/voice-order']);
    } catch (err) {
      this.error = 'Invalid credentials';
    }
  }

  // async loginWithGoogle() {
  //   try {
  //     await this.auth.loginWithGoogle();
  //     this.router.navigate(['/voice-order']);
  //   } catch (err) {
  //     this.error = 'Google login failed';
  //   }
  // }

  forgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.error = 'Enter your email first.';
      return;
    }
    this.auth.sendPasswordReset(email).then(() => {
      this.error = 'Password reset email sent!';
    }).catch(() => {
      this.error = 'Unable to send reset email.';
    });
  }

  forgotUsername() {
    // You can replace this with a dialog or redirect
    this.error = 'Please contact support to retrieve your username.';
  }
}
