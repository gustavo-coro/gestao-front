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
import { ApiService, Supplier } from '../../services/api.service';
import { isValid as isValidCPF } from '@fnando/cpf';
import { isValid as isValidCNPJ } from '@fnando/cnpj';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
]
})
export class SupplierFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private supplierIdFromRoute?: string; // Armazena o CPF/CNPJ original da rota, usado como ID

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome_fornecedor: ['', Validators.required],
      cpf_cnpj_fornecedor: ['', [Validators.required, this.validateCpfCnpj]],
      email_fornecedor: ['', [Validators.required, Validators.email, this.validateCompanyEmail]],
      telefone_fornecedor: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      endereco_fornecedor: ['', Validators.required]
    });

    const routeCpfCnpj = this.route.snapshot.paramMap.get('cpf_cnpj_fornecedor');
    if (routeCpfCnpj) {
      this.isEdit = true;
      this.supplierIdFromRoute = routeCpfCnpj; // Assume-se que este é o ID (CPF/CNPJ numérico)
      this.api.getSupplier(this.supplierIdFromRoute).subscribe(supplierData => {
        const dataToPatch = { ...supplierData };
        // Formata o CPF/CNPJ para exibição se vier numérico da API
        if (dataToPatch.cpf_cnpj_fornecedor) {
          dataToPatch.cpf_cnpj_fornecedor = this.applyCpfCnpjMask(String(dataToPatch.cpf_cnpj_fornecedor));
        }
        this.form.patchValue(dataToPatch);
      });
    }
  }

  // Função auxiliar para aplicar a máscara de CPF/CNPJ
  private applyCpfCnpjMask(value: string): string {
    const numericValue = value.replace(/\D/g, '');
    let maskedValue = numericValue;

    if (numericValue.length <= 11) { // CPF
      // Formata CPF: 000.000.000-00
      maskedValue = numericValue.replace(/(\d{3})(\d)/, '$1.$2');
      maskedValue = maskedValue.replace(/(\d{3})(\d)/, '$1.$2'); // Para o segundo grupo de 3
      maskedValue = maskedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      // Refinando a formatação de CPF para ser mais incremental como no formatCpfCnpj original
      if (numericValue.length <= 3) maskedValue = numericValue;
      else if (numericValue.length <= 6) maskedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3)}`;
      else if (numericValue.length <= 9) maskedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3, 6)}.${numericValue.substring(6)}`;
      else maskedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3, 6)}.${numericValue.substring(6, 9)}-${numericValue.substring(9, 11)}`;

    } else { // CNPJ
      // Formata CNPJ: 00.000.000/0000-00
      maskedValue = numericValue.substring(0, 14); // Limita a 14 dígitos
      if (maskedValue.length <= 2) return maskedValue;
      if (maskedValue.length <= 5) return `${maskedValue.substring(0, 2)}.${maskedValue.substring(2)}`;
      if (maskedValue.length <= 8) return `${maskedValue.substring(0, 2)}.${maskedValue.substring(2, 5)}.${maskedValue.substring(5)}`;
      if (maskedValue.length <= 12) return `${maskedValue.substring(0, 2)}.${maskedValue.substring(2, 5)}.${maskedValue.substring(5, 8)}/${maskedValue.substring(8)}`;
      maskedValue = `${maskedValue.substring(0, 2)}.${maskedValue.substring(2, 5)}.${maskedValue.substring(5, 8)}/${maskedValue.substring(8, 12)}-${maskedValue.substring(12, 14)}`;
    }
    return maskedValue;
  }

  // Validação de CPF/CNPJ
  validateCpfCnpj(control: AbstractControl) {
    const value = control.value.replace(/\D/g, ''); // Remove não numéricos para validação
    if (value.length === 0 && !control.hasError('required')) { // Não valida se não for obrigatório e estiver vazio
        return null;
    }
    if (value.length === 11) {
      return isValidCPF(value) ? null : { invalidCpf: true };
    }
    if (value.length === 14) {
      return isValidCNPJ(value) ? null : { invalidCnpj: true };
    }
    // Se não for nem 11 nem 14 dígitos após limpar, mas o campo for obrigatório e preenchido,
    // pode ser considerado inválido de forma genérica ou aguardar mais input.
    // A validação de `required` já cuida do caso de estar vazio.
    // Se tem algo mas não tem 11 ou 14 dígitos, pode ser um erro de "comprimento inválido"
    if (value.length > 0 && value.length < 11) return { invalidCpfCnpjLength: true};
    if (value.length > 11 && value.length < 14) return { invalidCpfCnpjLength: true};

    return null; // Não retorna erro se não se encaixar nos critérios de CPF/CNPJ (ex: campo sendo preenchido)
  }

  // Validação de e-mail corporativo
  validateCompanyEmail(control: AbstractControl) {
    const email_fornecedor = control.value;
    // A validação original apenas testa o padrão geral de e-mail.
    // Se a intenção era validar se termina com .com.br, a lógica precisa ser ajustada.
    // Exemplo: const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com\.br$/i;
    // A mensagem de erro no HTML sugere que deveria terminar com .com.br, mas a regex não impõe isso.
    // Vamos manter a regex original, mas a mensagem de erro no HTML pode precisar de ajuste.
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (email_fornecedor && !pattern.test(email_fornecedor)) { // Adicionado `email_fornecedor &&` para não validar campo vazio aqui (required já faz)
      return { invalidEmailFormat: true }; // Chave de erro mais genérica
    }
    // Se a validação específica de ".com.br" for necessária:
    // if (email_fornecedor && !email_fornecedor.toLowerCase().endsWith('.com.br')) {
    //   return { mustBeComBr: true }; // Use esta chave no template
    // }
    return null;
  }

  // Formatação de CPF/CNPJ durante a digitação
  formatCpfCnpj(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const formattedValue = this.applyCpfCnpjMask(value);
    this.form.get('cpf_cnpj_fornecedor')?.setValue(formattedValue, { emitEvent: false });
  }

  // Formatação de telefone_fornecedor
  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = `(${value.substring(0, 2)}`;
    }
    if (value.length > 2) { // DDD preenchido
        const numeroPrincipal = value.substring(2);
        if (numeroPrincipal.length > 0) {
            formattedValue += `) `;
            if (value.length <= 10) { // Fixo (XX) XXXX-XXXX ou Celular (XX) XXXXX-XXX (incompleto)
                const parte1 = numeroPrincipal.substring(0, 4);
                const parte2 = numeroPrincipal.substring(4, 8);
                formattedValue += parte1;
                if (parte2) {
                    formattedValue += `-${parte2}`;
                }
            } else { // Celular (XX) XXXXX-XXXX (com 9 dígitos)
                const parte1 = numeroPrincipal.substring(0, 5);
                const parte2 = numeroPrincipal.substring(5, 9);
                formattedValue += parte1;
                if (parte2) {
                    formattedValue += `-${parte2}`;
                }
            }
        }
    }
    this.form.get('telefone_fornecedor')?.setValue(formattedValue.substring(0, 15), { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
      console.warn('Formulário inválido:', this.form.errors, this.form.value);
      return;
    }

    // Cria uma cópia dos dados do formulário para manipulação
    const formData = { ...this.form.value };

    // Limpa o CPF/CNPJ: remove a pontuação para enviar apenas números
    if (formData.cpf_cnpj_fornecedor) {
      formData.cpf_cnpj_fornecedor = String(formData.cpf_cnpj_fornecedor).replace(/\D/g, '');
    }

    // Opcional: Limpar o Telefone também, se o backend esperar apenas números
    // if (formData.telefone_fornecedor) {
    //   formData.telefone_fornecedor = String(formData.telefone_fornecedor).replace(/\D/g, '');
    // }

    console.log('onSubmit supplier (dados limpos):', formData);

    const obs = this.isEdit
      ? this.api.updateSupplier(this.supplierIdFromRoute!, formData) // supplierIdFromRoute é o ID da rota
      : this.api.createSupplier(formData);

    obs.subscribe({
      next: (response) => {
        console.log('Fornecedor salvo com sucesso', response);
        this.router.navigate(['/fornecedor']);
      },
      error: err => console.error('Erro ao salvar fornecedor:', err)
    });
  }
}