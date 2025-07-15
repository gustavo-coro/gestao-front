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
import { ApiService, Employee } from '../../services/api.service';
import { isValid as isValidCPF } from '@fnando/cpf';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar"; // Adicione esta importação

@Component({
  standalone: true,
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule // E adicione aqui também
    ,
    MatIconModule,
    MatProgressBarModule
]
})
export class EmployeeFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private cpf?: string;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.validateCompanyEmail]],
      cpf: ['', [Validators.required, this.validateCPF]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      endereco: ['', Validators.required],
      contrato: ['', Validators.required],
      data_pagamento: ['', [Validators.required, this.futureDateValidator]],
      data_ferias: ['', [Validators.required, this.pastDateValidator]],
      salario: ['', [Validators.required, Validators.min(1320)]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });

    this.cpf = this.route.snapshot.paramMap.get('cpf') || undefined;
    if (this.cpf) {
      this.isEdit = true;
      this.api.getEmployee(this.cpf).subscribe(cust => {
        const employeeData = {
          ...cust,
          data_pagamento: cust.data_pagamento ? this.parseBackendDate(cust.data_pagamento) : null,
          data_ferias: cust.data_ferias ? this.parseBackendDate(cust.data_ferias) : null,
        };
        this.form.patchValue(employeeData);
        this.form.get('cpf')?.disable();
      });
    }
  }

  // Validações e formatações (sem alterações)
  validateCPF = (control: AbstractControl) => {
    if (!control.value) return null;
    return isValidCPF(control.value) ? null : { invalidCpf: true };
  }

  validateCompanyEmail = (control: AbstractControl) => {
    const email = control.value;
    if (!email) return null;
    return email.endsWith('.com') ? null : { invalidCompanyEmail: true };
  }

  futureDateValidator = (control: AbstractControl) => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today ? null : { pastDate: true };
  }

  pastDateValidator = (control: AbstractControl) => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? null : { futureDate: true };
  }

  formatCPF = (event: any) => {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    this.form.get('cpf')?.setValue(value.substring(0, 14), { emitEvent: false });
  }

  formatPhone = (event: any) => {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) value = `(${value.substring(0,2)}) ${value.substring(2)}`;
    if (value.length > 9) value = `${value.substring(0,9)}-${value.substring(9,14)}`;
    this.form.get('telefone')?.setValue(value.substring(0, 15), { emitEvent: false });
  }

  // Funções de conversão de data
  private parseBackendDate(isoString: string): Date {
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private convertToBackendFormat(date: Date): string | null {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
      console.error('Formulário inválido. Não foi enviado.');
      return;
    }

    if (this.isEdit && this.cpf) {
        // MODO DE EDIÇÃO: Enviar apenas os campos alterados
        const changedData: Partial<Employee> = {};
        const formValues = this.form.getRawValue();

        Object.keys(formValues).forEach(key => {
            const control = this.form.get(key);
            if (control && control.dirty) {
                (changedData as any)[key] = formValues[key];
            }
        });

        if (Object.keys(changedData).length === 0) {
            console.log('Nenhum dado foi alterado. Navegando de volta.');
            this.router.navigate(['/funcionario']);
            return;
        }

        if (changedData.data_pagamento) {
          changedData.data_pagamento = this.convertToBackendFormat(new Date(changedData.data_pagamento)) as any;
        }
        if (changedData.data_ferias) {
          changedData.data_ferias = this.convertToBackendFormat(new Date(changedData.data_ferias)) as any;
        }

        console.log('Enviando apenas os dados alterados:', changedData);

        this.api.updateEmployee(this.cpf, changedData).subscribe({
            next: () => this.router.navigate(['/funcionario']),
            error: err => console.error('Erro ao ATUALIZAR funcionário:', err)
        });

    } else {
        // MODO DE CRIAÇÃO: Enviar o formulário completo
        const employeeDataToSubmit = {
          ...this.form.value,
          data_pagamento: this.convertToBackendFormat(this.form.value.data_pagamento),
          data_ferias: this.convertToBackendFormat(this.form.value.data_ferias),
        };
        
        console.log('Enviando dados para criar novo funcionário:', employeeDataToSubmit);
        
        this.api.createEmployee(employeeDataToSubmit).subscribe({
            next: () => this.router.navigate(['/funcionario']),
            error: err => console.error('Erro ao CRIAR funcionário:', err)
        });
    }
  }
}