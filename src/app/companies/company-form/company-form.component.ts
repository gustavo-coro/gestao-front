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
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Company } from '../../services/api.service';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css'],
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
export class CompanyFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private companyIdFromRoute?: string; // Armazena o CNPJ original da rota, usado como ID

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome_empresa: ['', Validators.required],
      cnpj_empresa: ['', Validators.required], // Você pode adicionar um validador de CNPJ aqui se desejar
      endereco: ['', Validators.required],
      razao_social: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]]
    });

    // Obtém o CNPJ da rota. Assumimos que este é o ID numérico ou que a API lida com ele.
    const routeCnpj = this.route.snapshot.paramMap.get('cnpj_empresa');
    if (routeCnpj) {
      this.isEdit = true;
      this.companyIdFromRoute = routeCnpj;
      this.api.getCompany(this.companyIdFromRoute).subscribe(comp => {
        console.log('Empresa recebida:', comp);
        const companyData = { ...comp };
        
        // Se o CNPJ vier da API apenas com números, formata para exibição
        if (companyData.cnpj_empresa) {
          companyData.cnpj_empresa = this.applyCnpjMask(String(companyData.cnpj_empresa));
        }
        this.form.patchValue(companyData);
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

  formatCnpjOnInput(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const formattedValue = this.applyCnpjMask(value);
    this.form.get('cnpj_empresa')?.setValue(formattedValue, { emitEvent: false });

    // Opcional: Lógica para manter a posição do cursor, se necessário.
    // Pode ser complexo e muitas vezes bibliotecas de máscara dedicadas lidam melhor com isso.
    // Se o cursor pular para o final, você pode precisar de uma lógica mais sofisticada aqui.
  }

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
            if (numeroPrincipal.length <= 4) { // (XX) XXXX
                formattedValue += numeroPrincipal;
            } else if (numeroPrincipal.length <= 8) { // (XX) XXXX-XXXX (para fixo com 8 dígitos) ou (XX) XXXXX (para móvel incompleto)
                formattedValue += `${numeroPrincipal.substring(0, numeroPrincipal.length <= 5 && value.length === 11 ? 5 : 4)}`;
                if (numeroPrincipal.length > 4) {
                    formattedValue += `-${numeroPrincipal.substring(numeroPrincipal.length <= 5 && value.length === 11 ? 5 : 4, 9)}`;
                }
            } else { // (XX) XXXXX-XXXX (para móvel com 9 dígitos)
                 formattedValue += `${numeroPrincipal.substring(0, 5)}-${numeroPrincipal.substring(5, 9)}`;
            }
        }
    }
    // Limita o tamanho total da string formatada. (XX) XXXXX-XXXX tem 15 caracteres.
    this.form.get('telefone')?.setValue(formattedValue.substring(0,15), { emitEvent: false });
  }


  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Para exibir mensagens de erro de validação
      console.warn('Formulário inválido:', this.form.errors);
      return;
    }

    // Cria uma cópia dos dados do formulário para manipulação
    const formData = { ...this.form.value };

    // Limpa o CNPJ: remove a pontuação para enviar apenas números
    if (formData.cnpj_empresa) {
      formData.cnpj_empresa = String(formData.cnpj_empresa).replace(/\D/g, '');
    }

    // Opcional: Limpar o Telefone também, se o backend esperar apenas números
    // if (formData.telefone) {
    //   formData.telefone = String(formData.telefone).replace(/\D/g, '');
    // }

    console.log('onSubmit company (dados limpos):', formData);

    const obs = this.isEdit
      ? this.api.updateCompany(this.companyIdFromRoute!, formData) // companyIdFromRoute é o ID da rota
      : this.api.createCompany(formData);

    obs.subscribe({
      next: (empresa: Company) => {
        console.log('Empresa salva com sucesso', empresa);
        this.router.navigate(['/empresa']);
      },
      error: err => console.error('Erro ao salvar empresa:', err)
    });
  }
}