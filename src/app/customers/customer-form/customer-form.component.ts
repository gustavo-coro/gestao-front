import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Customer } from '../../services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { isValid as isValidCPF } from '@fnando/cpf';
import { isValid as isValidCNPJ } from '@fnando/cnpj';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule
]
})
export class CustomerFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  isLoading = false;
  private cpf_cnpj?: string;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf_cnpj: ['', [Validators.required, this.validateCpfCnpj]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      endereco: ['', Validators.required]
    });

    this.cpf_cnpj = this.route.snapshot.paramMap.get('cpf_cnpj') || undefined;
    if (this.cpf_cnpj) {
      this.isLoading = true;
      this.isEdit = true;
      this.api.getCustomer(this.cpf_cnpj).subscribe({
        next: (cust) => {
          this.form.patchValue(cust);
          this.isLoading = false;
        },
        error: (err) => {
          this.showError('Erro ao carregar venda');
          this.isLoading = false;
        }
      });
    }

    const routeCpfCnpj = this.route.snapshot.paramMap.get('cpf_cnpj');
    if (routeCpfCnpj) {
      this.isLoading = true;
      this.isEdit = true;
      this.cpf_cnpj = routeCpfCnpj;
      this.api.getCustomer(this.cpf_cnpj).subscribe({
        next: (cust) => {
          const customerData = { ...cust };
          if (customerData.cpf_cnpj) {
            if (customerData.cpf_cnpj.length <= 11) {
              customerData.cpf_cnpj = this.applyCpfMask(String(customerData.cpf_cnpj));
            } else if (customerData.cpf_cnpj.length > 11) {
              customerData.cpf_cnpj = this.applyCnpjMask(String(customerData.cpf_cnpj));
            }
          }
          this.form.patchValue(customerData);
          this.isLoading = false;
        },
        error: (err) => {
          this.showError('Erro ao carregar venda');
          this.isLoading = false;
        }
      });
    }
  }

  private applyCnpjMask(cnpj: string): string {
    const numericCnpj = cnpj.replace(/\D/g, '').substring(0, 14); // Remove não numéricos e limita a 14 dígitos

    if (numericCnpj.length === 0) {
      return '';
    }
    if (numericCnpj.length <= 2) {
      return numericCnpj;
    }
    if (numericCnpj.length <= 5) {
      return `${numericCnpj.substring(0, 2)}.${numericCnpj.substring(2)}`;
    }
    if (numericCnpj.length <= 8) {
      return `${numericCnpj.substring(0, 2)}.${numericCnpj.substring(2, 5)}.${numericCnpj.substring(5)}`;
    }
    if (numericCnpj.length <= 12) {
      return `${numericCnpj.substring(0, 2)}.${numericCnpj.substring(2, 5)}.${numericCnpj.substring(5, 8)}/${numericCnpj.substring(8)}`;
    }
    return `${numericCnpj.substring(0, 2)}.${numericCnpj.substring(2, 5)}.${numericCnpj.substring(5, 8)}/${numericCnpj.substring(8, 12)}-${numericCnpj.substring(12, 14)}`;
  }

  private applyCpfMask(cpf: string): string {
    const numericCpf = cpf.replace(/\D/g, '').substring(0, 11); // Remove non-digits and limit to 11 characters

    if (numericCpf.length === 0) {
      return '';
    }
    if (numericCpf.length <= 3) {
      return numericCpf;
    }
    if (numericCpf.length <= 6) {
      return `${numericCpf.substring(0, 3)}.${numericCpf.substring(3)}`;
    }
    if (numericCpf.length <= 9) {
      return `${numericCpf.substring(0, 3)}.${numericCpf.substring(3, 6)}.${numericCpf.substring(6)}`;
    }
    return `${numericCpf.substring(0, 3)}.${numericCpf.substring(3, 6)}.${numericCpf.substring(6, 9)}-${numericCpf.substring(9, 11)}`;
  }

  // Validação CPF/CNPJ
  validateCpfCnpj(control: AbstractControl) {
    const value = control.value.replace(/\D/g, '');
    if (value.length === 11 && !isValidCPF(value)) {
      return { invalidCpf: true };
    }
    if (value.length === 14 && !isValidCNPJ(value)) {
      return { invalidCnpj: true };
    }
    return null;
  }

  // Formatação CPF/CNPJ
  formatCpfCnpj(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
      if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    } else {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    this.form.get('cpf_cnpj')?.setValue(value.substring(0, 18), { emitEvent: false });
  }

  // Formatação Telefone
  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    if (value.length > 10) value = `${value.substring(0, 10)}-${value.substring(10, 14)}`;
    this.form.get('telefone')?.setValue(value.substring(0, 15), { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
      this.showError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.isLoading = true;

    // Cria uma cópia dos dados do formulário para manipulação
    const formData = { ...this.form.value };

    // Limpa o CNPJ: remove a pontuação para enviar apenas números
    if (formData.cpf_cnpj) {
      formData.cpf_cnpj = String(formData.cpf_cnpj).replace(/\D/g, '');
    }

    console.log(formData);

    const obs = this.isEdit
      ? this.api.updateCustomer(this.cpf_cnpj!, formData)
      : this.api.createCustomer(formData);

    obs.subscribe({
      next: (cliente: Customer) => {
        this.showSuccess('Cliente salvo com sucesso!');
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.showError('Erro ao salvar cliente. Por favor, tente novamente.');
        this.isLoading = false;
      }
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}