// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';

export interface User {
  email: string;
  password?: string;
}

export interface Customer {
  id: string;
  nome: string;
  email: string;
  cpf_cnpj: string;
  telefone: string;
  endereco: string;
}

export interface Sales {
  id: string;
  valor_total: number;
  data_venda: string;
  nota_fiscal: string;
  fk_cpf_cnpj_cliente: string;
  fk_forma_pagamento: number;
  fk_cpf_funcionario: string;
  itens: {
    fk_produto: number;
    qtd_item_produto: number;
  };
  cliente: {
    cpf_cnpj: string;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  };
  funcionario: {
    cpf: string;
    nome: string;
    telefone: string;
    email: string;
    endereco: string;
  };
  forma_pagamento: {
    id_forma_pagamento: number;
    nome_forma_pagamento: string;
  };
}

// Nova interface para as estatísticas
export interface SalesStats {
  numero_vendas: number;
  valor_total_vendas: number;
}


export interface Company {
  id: string;
  nome_empresa: string;
  cnpj_empresa: string;
  razao_social: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface Employee {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
  contrato: string;
  data_pagamento: string;
  data_ferias: string;
  salario: number;
  senha: string;
  role: string;
}

export interface Supplier {
  id: string;
  cpf_cnpj_fornecedor: string;
  nome_fornecedor: string;
  telefone_fornecedor: string;
  email_fornecedor: string;
  endereco_fornecedor: string;
}

export interface Product {
  id_produto?: number;
  nome_produto: string;
  qtd_produto: number;
  valor_custo: number;
  valor_venda: number;
  fk_cpf_cnpj_fornecedor: string;
}
export interface SupplierWithProducts {
  supplier: Supplier;
  products: Product[];
}

export interface Payment {
  id_forma_pagamento: string;
  nome_forma_pagamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://gestaoods.onrender.com';

  constructor(private http: HttpClient) { }

  // === Autenticação ===
  login(payload: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, payload);
  }

  registerUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/register`, user);
  }

  // === Clientes ===
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/clientes`);
  }

  getCustomer(cpf: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/clientes/${cpf}`);
  }

  createCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/clientes`, customer);
  }

  updateCustomer(cpf: string, customer: Partial<Omit<Customer, 'id'>>): Observable<Customer> {
    return this.http.patch<Customer>(`${this.baseUrl}/clientes/${cpf}`, customer);
  }

  deleteCustomer(cpf: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clientes/${cpf}`);
  }

  // === Empresas ===
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/empresa`);
  }

  getCompany(cnpj_empresa: string): Observable<Company> {
    const cleanedCnpj = cnpj_empresa.replace(/\D/g, '');
    const encodedCnpj = encodeURIComponent(cleanedCnpj);
    return this.http.get<Company>(`${this.baseUrl}/empresa/${encodedCnpj}`);
  }

  createCompany(company: Omit<Company, 'id'>): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/empresa`, company);
  }

  updateCompany(cnpj_empresa: string, company: Partial<Omit<Company, 'id'>>): Observable<Company> {
    return this.http.patch<Company>(`${this.baseUrl}/empresa/${cnpj_empresa}`, company);
  }

  deleteCompany(cnpj_empresa: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/empresa/${cnpj_empresa}`);
  }

  // === Funcionários ===
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/funcionario`);
  }

  getEmployee(cpf: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/funcionario/${cpf}`);
  }

  createEmployee(emp: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/funcionario`, emp);
  }

  updateEmployee(cpf: string, emp: Partial<Omit<Employee, 'id'>>): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/funcionario/${cpf}`, emp);
  }

  deleteEmployee(cpf: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/funcionario/${cpf}`);
  }

  // === Pedidos ===
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.baseUrl}/pedido`);
  }

  getSale(id: string): Observable<Sales> {
    return this.http.get<Sales>(`${this.baseUrl}/pedido/${id}`);
  }

  getSalesbyClient(cpf_cnpj: string): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.baseUrl}/pedido/cliente/${cpf_cnpj}`)
  }

  getSalesbyDate(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.baseUrl}/pedido/data`);
  }
  
  // Novo método para estatísticas
  getSalesStatsForMonth(month: number): Observable<SalesStats> {
    return this.http.get<SalesStats>(`${this.baseUrl}/pedido/mes/${month}`);
  }

  createSales(sales: Omit<Sales, 'id'>): Observable<Sales> {
    return this.http.post<Sales>(`${this.baseUrl}/pedido`, sales);
  }

  updateSales(id: string, sales: Partial<Omit<Sales, 'id'>>): Observable<Sales> {
    return this.http.patch<Sales>(`${this.baseUrl}/pedido/${id}`, sales);
  }

  deleteSales(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pedido/${id}`);
  }

  // === Fornecedores ===
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/fornecedor`);
  }

  getSupplier(cpf_cnpj_fornecedor: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/fornecedor/${cpf_cnpj_fornecedor}`);
  }

  createSupplier(supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/fornecedor`, supplier);
  }

  updateSupplier(cpf_cnpj_fornecedor: string, supplier: Partial<Omit<Supplier, 'id'>>): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.baseUrl}/fornecedor/${cpf_cnpj_fornecedor}`, supplier);
  }

  deleteSupplier(cpf_cnpj_fornecedor: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fornecedor/${cpf_cnpj_fornecedor}`);
  }

  getSupplierProducts(cpf_cnpj: string): Observable<SupplierWithProducts> {
    return this.http.get<SupplierWithProducts>(`${this.baseUrl}/fornecedores/${cpf_cnpj}/produtos`);
  }

  // === Produtos ===
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/produto`);
  }

  getProduct(id_produto: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/produto/${id_produto}`);
  }

  createProduct(product: Omit<Product, 'id_produto'>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/produto`, product);
  }

  updateProduct(id_produto: number, product: Partial<Omit<Product, 'id_produto'>>): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/produto/${id_produto}`, product);
  }

  deleteProduct(id_produto: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/produto/${id_produto}`);
  }

  // === Forma Pagamento ===
  getPayments(): Observable<Payment[]> {
    const mockPayments: Payment[] = [
      { id_forma_pagamento: '1', nome_forma_pagamento: 'Dinheiro' },
      { id_forma_pagamento: '2', nome_forma_pagamento: 'Cartão de Crédito' },
      { id_forma_pagamento: '3', nome_forma_pagamento: 'Cartão de Débito' },
      { id_forma_pagamento: '4', nome_forma_pagamento: 'PIX' },
      { id_forma_pagamento: '5', nome_forma_pagamento: 'Cheque' },
    ];
    return of(mockPayments).pipe(delay(500));
  }
}