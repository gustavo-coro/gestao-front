// src/app/app.routes.ts
import type { Routes } from '@angular/router';
///auth/email/senhja
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register-user/register-user.component').then(m => m.RegisterUserComponent) },

  // Rota para Home
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },

  // Clientes
  { path: 'clientes', loadComponent: () => import('./customers/customer-list/customer-list.component').then(m => m.CustomerListComponent) },
  { path: 'clientes/new', loadComponent: () => import('./customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent) },
  { path: 'clientes/:cpf_cnpj', loadComponent: () => import('./customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent) },

  // Empresas
  { path: 'empresa', loadComponent: () => import('./companies/company-list/company-list.component').then(m => m.CompanyListComponent) },
  { path: 'empresa/new', loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent) },
  { path: 'empresa/:cnpj_empresa', loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent) },

  // Funcionários
  {
    path: 'funcionario',
    loadComponent: () => import('./employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
  },
  {
    path: 'funcionario/new',
    loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
  },
  {
    path: 'funcionario/:cpf',
    loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
  },

  // Vendas
  { path: 'vendas', loadComponent: () => import('./sales/sales-list/sales-list.component').then(m => m.SalesListComponent) },
  { path: 'vendas/new', loadComponent: () => import('./sales/sales-form/sales-form.component').then(m => m.SalesFormComponent) },
  { path: 'vendas/:id', loadComponent: () => import('./sales/sales-form/sales-form.component').then(m => m.SalesFormComponent) },

  // Fornecedor
  { path: 'fornecedor', loadComponent: () => import('./supplier/supplier-list/supplier-list.component').then(m => m.SupplierListComponent) },
  { path: 'fornecedor/new', loadComponent: () => import('./supplier/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) },
  { path: 'fornecedor/:cpf_cnpj_fornecedor', loadComponent: () => import('./supplier/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) },

  // Produtos
  { path: 'produto', loadComponent: () => import('./supplier/product-management/product-management.component').then(m => m.ProductManagementComponent) },

  {
    path: 'fornecedor-produtos',
    loadComponent: () => import('./supplier/supplier-products/supplier-products.component').then(m => m.SupplierProductsComponent)
  },

  // Nova rota para Gestão de Produtos
  {
    path: 'products',
    // Ajuste o caminho se o seu ProductManagementComponent estiver em local diferente
    loadComponent: () => import('./supplier/product-management/product-management.component').then(m => m.ProductManagementComponent),
    title: 'Gestão de Produtos'
  },

  // Rota curinga (mantém por último)
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];