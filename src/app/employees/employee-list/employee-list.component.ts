import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService, Employee } from '../../services/api.service';
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
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
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
    FormsModule
  ]
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Employee>();
  originalEmployees: Employee[] = [];
  filterValue: string = '';
  displayedColumns = ['nome', 'email', 'cpf', 'telefone', 'role', 'salario', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    if (this.dataSource.data.length > 0 && !this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadEmployees() {
    this.api.getEmployees().subscribe({
      next: (list) => {
        this.originalEmployees = list;
        this.dataSource.data = list;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (err) => console.error('Erro ao carregar funcionários', err)
    });
  }

  formatCpfForDisplay(value?: string): string {
    if (!value) return '';
    
    const numericValue = String(value).replace(/\D/g, '');
    
    if (numericValue.length === 0) return '';
    
    let maskedValue = numericValue.substring(0, 11);
    
    if (maskedValue.length > 9) {
      maskedValue = `${maskedValue.substring(0, 3)}.${maskedValue.substring(3, 6)}.${maskedValue.substring(6, 9)}-${maskedValue.substring(9)}`;
    } else if (maskedValue.length > 6) {
      maskedValue = `${maskedValue.substring(0, 3)}.${maskedValue.substring(3, 6)}.${maskedValue.substring(6)}`;
    } else if (maskedValue.length > 3) {
      maskedValue = `${maskedValue.substring(0, 3)}.${maskedValue.substring(3)}`;
    }
    
    return maskedValue;
  }

  applyFilter() {
    const filterText = this.filterValue.trim().toLowerCase();

    if (!filterText) {
      this.dataSource.data = this.originalEmployees;
    } else {
      this.dataSource.data = this.originalEmployees.filter(employee =>
        (employee.cpf?.toLowerCase().includes(filterText)) ||
        (employee.nome?.toLowerCase().includes(filterText)) ||
        (employee.email?.toLowerCase().includes(filterText)) ||
        (employee.telefone?.toLowerCase().includes(filterText))
      );
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter() {
    this.filterValue = '';
    this.applyFilter();
  }
}