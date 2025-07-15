// src/app/companies/company-list/company-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiService, Company } from '../../services/api.service';

// Importações para o Filtro
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
    if (length === 0 || pageSize === 0) { // Adicionado para tratar length 0
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
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css'],
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
export class CompanyListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Company>([]);
  originalCompanies: Company[] = [];
  filterValue: string = '';

  columns = ['nome_empresa', 'cnpj_empresa', 'razao_social', 'email', 'telefone', 'endereco', 'actions']; //

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getCompanies().subscribe(list => {
      this.originalCompanies = list;
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
   * Formata um valor de CNPJ para exibição com máscara (XX.XXX.XXX/XXXX-XX).
   * @param value O valor do CNPJ (string de números).
   * @returns O valor formatado ou string vazia se a entrada for inválida.
   */
  public formatCnpjForDisplay(value?: string): string {
    if (!value) {
      return '';
    }
    // Remove todos os caracteres não numéricos e garante que estamos trabalhando com uma string
    const numericValue = String(value).replace(/\D/g, '');

    if (numericValue.length === 0) {
      return '';
    }

    // CNPJ tem 14 dígitos. Pegamos no máximo 14.
    const cnpj = numericValue.substring(0, 14);
    let maskedValue = cnpj; // Valor padrão caso o CNPJ seja curto demais para a máscara completa

    if (cnpj.length > 12) {
      // XX.XXX.XXX/XXXX-XX
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`;
    } else if (cnpj.length > 8) {
      // XX.XXX.XXX/XXXX
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8)}`;
    } else if (cnpj.length > 5) {
      // XX.XXX.XXX
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5)}`;
    } else if (cnpj.length > 2) {
      // XX.XXX
      maskedValue = `${cnpj.substring(0, 2)}.${cnpj.substring(2)}`;
    }
    // Se cnpj.length <= 2, maskedValue permanece como os dígitos iniciais.

    return maskedValue;
  }

  applyFilter() {
    const filterText = this.filterValue.trim().toLowerCase(); //

    if (!filterText) {
      this.dataSource.data = this.originalCompanies; //
    } else {
      this.dataSource.data = this.originalCompanies.filter(company => //
      (company.nome_empresa?.toLowerCase().includes(filterText) || //
        company.cnpj_empresa?.toLowerCase().includes(filterText) || // Filtra pelo CNPJ original (sem máscara)
        company.email?.toLowerCase().includes(filterText) || //
        company.telefone?.toLowerCase().includes(filterText)) //
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