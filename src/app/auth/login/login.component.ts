// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, //
  FormGroup, //
  Validators, //
  ReactiveFormsModule //
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService } from '../../services/api.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true, //
  selector: 'app-login', //
  templateUrl: './login.component.html', //
  styleUrls: ['./login.component.css'], //
  imports: [
    CommonModule, //
    ReactiveFormsModule, //
    RouterLink, //
    MatCardModule, //
    MatFormFieldModule, //
    MatInputModule, //
    MatButtonModule //
    ,
    MatIconModule
]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; //

  constructor(
    private fb: FormBuilder, //
    private api: ApiService, //
    private router: Router //
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({ //
      email: ['', [Validators.required, Validators.email]], //
      senha: ['', Validators.required] //
    });
  }

  onSubmit() {
    console.log('Enviando para a API:', this.loginForm.value);

    if (this.loginForm.invalid) return;

    this.api.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        localStorage.setItem('token', response.token);
        // Check for returnUrl in query params
        const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro detalhado do backend:', err.error.message);
      }
    });
}
}