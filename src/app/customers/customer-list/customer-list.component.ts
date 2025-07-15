// src/app/customers/customer-list/customer-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService, Customer } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

function getPortuguesePaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Itens por página:';
  paginatorIntl.nextPageLabel = 'Próxima página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primeira página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    return `${page * pageSize + 1} - ${Math.min((page + 1) * pageSize, length)} de ${length}`;
  };
  return paginatorIntl;
}

@Component({
  standalone: true,
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: getPortuguesePaginatorIntl() }
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class CustomerListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  originalCustomers: Customer[] = []; // Para guardar a lista original
  filterValue: string = ''; // Variável para o ngModel do filtro

  columns = ['nome', 'email', 'cpf_cnpj', 'telefone', 'endereco', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getCustomers().subscribe(list => {
      this.originalCustomers = list;
      this.dataSource.data = list;
      // Conexão inicial do paginador
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngAfterViewInit() {
    // Garante que o paginador seja atribuído ao dataSource após a view ser inicializada.
    if (this.dataSource.data.length > 0 && !this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadCustomers() {
    this.api.getCustomers().subscribe({
      next: (list) => {
        this.dataSource.data = list;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error('Erro ao carregar os clientes', err)
    });
  }

/**
 * Formata um valor de CPF ou CNPJ para exibição com máscara
 * CPF: ###.###.###-## (11 dígitos)
 * CNPJ: ##.###.###/####-## (14 dígitos)
 * @param value O valor do CPF/CNPJ (string de números)
 * @returns O valor formatado ou string vazia se a entrada for inválida
 */
public formatCpfCnpjForDisplay(value?: string): string {
  if (!value) {
    return '';
  }

  // Remove todos os caracteres não numéricos
  const numericValue = String(value).replace(/\D/g, '');

  if (numericValue.length === 0) {
    return '';
  }

  // Determina se é CPF (11 dígitos) ou CNPJ (14 dígitos)
  const isCpf = numericValue.length <= 11;

  if (isCpf) {
    // Formatação para CPF (###.###.###-##)
    const cpf = numericValue.substring(0, 11);
    let maskedValue = cpf;

    if (cpf.length > 9) {
      maskedValue = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
    } else if (cpf.length > 6) {
      maskedValue = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6)}`;
    } else if (cpf.length > 3) {
      maskedValue = `${cpf.substring(0, 3)}.${cpf.substring(3)}`;
    }

    return maskedValue;
  } else {
    // Formatação para CNPJ (##.###.###/####-##)
    const cnpj = numericValue.substring(0, 14);
    let maskedValue = cnpj;

    if (cnpj.length > 12) {
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12)}`;
    } else if (cnpj.length > 8) {
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8)}`;
    } else if (cnpj.length > 5) {
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5)}`;
    } else if (cnpj.length > 2) {
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2)}`;
    }

    return maskedValue;
  }
}
  applyFilter() {
    const filterText = this.filterValue.trim().toLowerCase();

    if (!filterText) {
      this.dataSource.data = this.originalCustomers;
    } else {
      this.dataSource.data = this.originalCustomers.filter(customer =>
      (customer.cpf_cnpj?.toLowerCase().includes(filterText) ||
        customer.nome?.toLowerCase().includes(filterText) ||
        customer.email?.toLowerCase().includes(filterText) ||
        customer.telefone?.toLowerCase().includes(filterText))
      );
    }

    // Após filtrar, se o paginador existir, volte para a primeira página
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter() {
    this.filterValue = '';
    this.applyFilter();
  }
}