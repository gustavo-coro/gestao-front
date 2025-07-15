import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService, User } from '../../services/api.service';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  imports: [
    CommonModule, // para *ngIf, *ngFor
    ReactiveFormsModule, // para formGroup, formControlName
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink // para <a routerLink>
    ,
    MatIconModule
]
})
export class RegisterUserComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      console.warn('Formulário inválido', this.registerForm.value);
      return;
    }

    const payload: User = this.registerForm.value;
    console.log('Tentando cadastrar usuário:', payload);

    this.api.registerUser(payload).subscribe({
      next: user => {
        console.log('Cadastro bem-sucedido:', user);
        alert('Cadastro realizado com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no cadastro:', err);
        alert(
          'Falha no cadastro: ' +
            (err.error?.message || `${err.status} ${err.statusText}`)
        );
      }
    });
  }
}
