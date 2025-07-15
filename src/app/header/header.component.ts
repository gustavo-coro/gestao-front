// src/app/components/header/header.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
]
})
export class HeaderComponent {
  // Links equivalentes ao Home
  mainActions = [
    { 
      label: 'Clientes',
      routes: [
        { path: '/clientes', label: 'Listar Clientes' },
        { path: '/clientes/new', label: 'Cadastrar Cliente' }
      ]
    },
    { 
      label: 'Empresas',
      routes: [
        { path: '/empresa', label: 'Listar Empresas' },
        { path: '/empresa/new', label: 'Cadastrar Empresa' }
      ]
    },
    { 
      label: 'Funcionários',
      routes: [
        { path: '/funcionario', label: 'Listar Funcionários' },
        { path: '/funcionario/new', label: 'Cadastrar Funcionário' }
      ]
    },
    { 
      label: 'Vendas',
      routes: [
        { path: '/vendas', label: 'Listar Vendas' },
        { path: '/vendas/new', label: 'Cadastrar Venda' }
      ]
    },
    { 
      label: 'Fornecedores',
      routes: [
        { path: '/fornecedor', label: 'Listar Fornecedores' },
        { path: '/fornecedor/new', label: 'Cadastrar Fornecedor' },
        { path: '/fornecedor-produtos', label: 'Consultar Produtos' }
      ]
    },
    {
      label: 'Produtos',
      routes: [
        { path: '/products', label: 'Gerenciar Produtos' }
      ]
    }
  ];

  constructor(private router: Router) {}

  logout() {
    console.log('Usuário deslogado');
    this.router.navigate(['/login']);
  }
}