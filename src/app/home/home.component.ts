// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService, SalesStats, Product } from '../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

interface DashboardCard {
  title: string;
  count: number;
  icon: string;
  link: string;
  recentItems: any[];
}

interface Customer { [key: string]: any; }
interface Company { [key: string]: any; }
interface Employee { [key: string]: any; }
interface Supplier { [key: string]: any; }
interface Sale { [key: string]: any; }

interface MonthlyStats extends SalesStats {
  monthName: string;
  monthNumber: number;
}

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    CurrencyPipe,
    MatTableModule,
  ],
})
export class HomeComponent implements OnInit {
  dashboardCards: DashboardCard[] = [];
  monthlyStats: MonthlyStats[] = [];
  lowStockProducts: Product[] = [];
  displayedColumns: string[] = ['nome_produto', 'qtd_produto'];
  isLoading = true;
  isLoadingStats = true;
  isLoadingProducts = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadMonthlySalesStats();
    this.loadLowStockProducts();
  }

  loadDashboardData() {
    this.isLoading = true;
    forkJoin({
      customers: this.api.getCustomers(),
      companies: this.api.getCompanies(),
      employees: this.api.getEmployees(),
      suppliers: this.api.getSuppliers(),
      products: this.api.getProducts(),
      sales: this.api.getSales()
    }).subscribe({
      next: (response: {
        customers: Customer[];
        companies: Company[];
        employees: Employee[];
        suppliers: Supplier[];
        products: Product[];
        sales: Sale[];
      }) => {
        const getRecentItems = (items: any[]) => items.slice(-3).reverse();

        this.dashboardCards = [
          { title: 'Clientes', count: response.customers.length, icon: 'people', link: '/clientes', recentItems: getRecentItems(response.customers) },
          { title: 'Empresas', count: response.companies.length, icon: 'business', link: '/empresa', recentItems: getRecentItems(response.companies) },
          { title: 'Funcionários', count: response.employees.length, icon: 'badge', link: '/funcionario', recentItems: getRecentItems(response.employees) },
          { title: 'Fornecedores', count: response.suppliers.length, icon: 'local_shipping', link: '/fornecedor', recentItems: getRecentItems(response.suppliers) },
          { title: 'Produtos', count: response.products.length, icon: 'inventory_2', link: '/products', recentItems: getRecentItems(response.products) },
          { title: 'Vendas', count: response.sales.length, icon: 'point_of_sale', link: '/vendas', recentItems: getRecentItems(response.sales) },
        ];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar dados da dashboard', err);
        this.isLoading = false;
      }
    });
  }

  loadMonthlySalesStats() {
    this.isLoadingStats = true;
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const monthRequests = Array.from({ length: 12 }, (_, i) =>
      this.api.getSalesStatsForMonth(i + 1).pipe(
        map(stats => ({
          ...stats,
          monthName: monthNames[i],
          monthNumber: i + 1
        })),
        catchError(() => {
          // Em caso de erro, retorna um valor padrão para não quebrar o forkJoin
          return of({
            numero_vendas: 0,
            valor_total_vendas: 0,
            monthName: monthNames[i],
            monthNumber: i + 1
          });
        })
      )
    );

    forkJoin(monthRequests).subscribe({
      next: (stats) => {
        this.monthlyStats = stats;
        this.isLoadingStats = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas mensais', err);
        this.isLoadingStats = false;
      }
    });
  }

  loadLowStockProducts() {
    this.isLoadingProducts = true;
    this.api.getProducts().pipe(
      map(products => products.sort((a, b) => a.qtd_produto - b.qtd_produto).slice(0, 100)),
      catchError(error => {
        console.error('Erro ao buscar produtos', error);
        return of([]);
      })
    ).subscribe(products => {
      this.lowStockProducts = products;
      this.isLoadingProducts = false;
    });
  }
}