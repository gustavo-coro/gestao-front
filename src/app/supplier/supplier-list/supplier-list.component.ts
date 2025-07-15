// src/app/supplier/supplier-list/supplier-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core'; // Adicionado ViewChild, AfterViewInit
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiService, Supplier } from '../../services/api.service';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Importações para o Paginator
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';

// Função para traduzir o paginador (mantida como no seu código original)
function getPortuguesePaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Itens por página:';
  paginatorIntl.nextPageLabel = 'Próxima página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primeira página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
  return paginatorIntl;
}

@Component({
  standalone: true,
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: getPortuguesePaginatorIntl() }
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ]
})
export class SupplierListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Supplier>([]);
  originalSuppliers: Supplier[] = [];
  filterValue: string = '';

  columns = ['nome_fornecedor', 'cpf_cnpj_fornecedor', 'email_fornecedor', 'telefone_fornecedor', 'endereco_fornecedor', 'actions']; //

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getSuppliers().subscribe(list => {
      console.log(list);
      this.originalSuppliers = list;
      this.dataSource.data = list;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngAfterViewInit() {
    if (this.dataSource.data.length > 0 && !this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  /**
   * Formata um valor de CPF ou CNPJ para exibição com máscara.
   * @param value O valor do CPF/CNPJ (string de números).
   * @returns O valor formatado ou string vazia se a entrada for inválida.
   */
  public formatCpfCnpjForDisplay(value?: string): string {
    if (!value) {
      return '';
    }
    const numericValue = String(value).replace(/\D/g, '');

    if (numericValue.length === 0) {
      return '';
    }

    let maskedValue = '';

    if (numericValue.length <= 11) { // Formata como CPF
      maskedValue = numericValue; // Inicia com o valor numérico
      if (numericValue.length > 9) {
        maskedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3, 6)}.${numericValue.substring(6, 9)}-${numericValue.substring(9, 11)}`;
      } else if (numericValue.length > 6) {
        maskedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3, 6)}.${numericValue.substring(6)}`;
      } else if (numericValue.length > 3) {
        maskedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3)}`;
      }
      // Não retorna aqui, permite que o valor parcialmente formatado seja retornado se não completo
    } else { // Formata como CNPJ (considera 14 dígitos)
      const cnpj = numericValue.substring(0, 14); // Garante no máximo 14 dígitos
      maskedValue = cnpj; // Inicia com o valor numérico (ou parte dele)
      if (cnpj.length > 12) {
        maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`;
      } else if (cnpj.length > 8) {
        maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8)}`;
      } else if (cnpj.length > 5) {
        maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5)}`;
      } else if (cnpj.length > 2) {
        maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2)}`;
      }
    }
    return maskedValue;
  }

  applyFilter() {
    const filterText = this.filterValue.trim().toLowerCase(); //

    if (!filterText) {
      this.dataSource.data = this.originalSuppliers; //
    } else {
      this.dataSource.data = this.originalSuppliers.filter(supplier => //
      (supplier.nome_fornecedor?.toLowerCase().includes(filterText) || //
        supplier.cpf_cnpj_fornecedor?.toLowerCase().includes(filterText) || // // Filtra pelo valor original (sem máscara)
        supplier.email_fornecedor?.toLowerCase().includes(filterText) || //
        supplier.telefone_fornecedor?.toLowerCase().includes(filterText)) //
      );
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); //
    }
  }

  clearFilter() {
    this.filterValue = ''; //
    this.applyFilter(); //
  }
}