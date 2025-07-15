import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService, Product, Supplier } from '../../services/api.service';
import { Subject, forkJoin } from 'rxjs'; // Importando forkJoin
import { takeUntil, debounceTime } from 'rxjs/operators';
import { MatPaginatorModule } from "@angular/material/paginator";

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatPaginatorModule
],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  filterForm: FormGroup;
  
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  suppliers: Supplier[] = [];
  
  displayedColumns: string[] = ['nome_produto', 'qtd_produto', 'valor_custo', 'valor_venda', 'fornecedor', 'actions'];
  editingProductId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      nome_produto: ['', Validators.required],
      qtd_produto: ['', [Validators.required, Validators.min(0)]],
      valor_custo: ['', [Validators.required, Validators.min(0)]],
      valor_venda: ['', [Validators.required, Validators.min(0)]],
      fk_cpf_cnpj_fornecedor: ['', Validators.required]
    });

    this.filterForm = this.fb.group({
      nomeProdutoFilter: [''],
      fornecedorFilter: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData(); // Carrega produtos e fornecedores juntos
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData(): void {
    forkJoin({
      products: this.api.getProducts(),
      suppliers: this.api.getSuppliers()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ products, suppliers }) => {
        this.allProducts = products;
        this.suppliers = suppliers;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        this.snackBar.open('Erro ao carregar dados da página.', 'Fechar', { duration: 3000 });
      }
    });
  }
  
  setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const { nomeProdutoFilter, fornecedorFilter } = this.filterForm.value;
    const nomeProdutoFilterLower = nomeProdutoFilter?.toLowerCase() || '';
    const fornecedorFilterLower = fornecedorFilter?.toLowerCase() || '';

    this.filteredProducts = this.allProducts.filter(product => {
      const matchesNomeProduto = nomeProdutoFilterLower 
        ? product.nome_produto.toLowerCase().includes(nomeProdutoFilterLower) 
        : true;

      const supplierName = this.getSupplierName(product.fk_cpf_cnpj_fornecedor).toLowerCase();
      const matchesFornecedor = fornecedorFilterLower 
        ? supplierName.includes(fornecedorFilterLower) || product.fk_cpf_cnpj_fornecedor.includes(fornecedorFilterLower)
        : true;
        
      return matchesNomeProduto && matchesFornecedor;
    });
  }
  
  clearFilters(): void {
    this.filterForm.reset({ nomeProdutoFilter: '', fornecedorFilter: '' });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    const productData = this.productForm.value;
    const apiCall = this.editingProductId !== null
      ? this.api.updateProduct(this.editingProductId, productData)
      : this.api.createProduct(productData);
      
    apiCall.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const message = this.editingProductId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
        this.snackBar.open(message, 'Fechar', { duration: 3000 });
        this.resetForm();
        this.loadInitialData(); // Recarrega tudo
      },
      error: (err) => this.handleApiError(err, this.editingProductId ? 'atualizar' : 'cadastrar')
    });
  }

  handleApiError(err: any, action: string): void {
    console.error(`Erro ao ${action} produto:`, err);
    this.snackBar.open(`Erro ao ${action} o produto. Verifique os dados e tente novamente.`, 'Fechar', { duration: 3000 });
  }

  editProduct(product: Product): void {
    if (product.id_produto === undefined) {
      this.snackBar.open('Produto sem ID não pode ser editado.', 'Fechar', { duration: 3000 });
      return;
    }
    this.editingProductId = product.id_produto;
    this.productForm.patchValue(product);
    window.scrollTo(0, 0);
  }

  deleteProduct(id_produto: number | undefined): void {
    if (id_produto === undefined) {
        this.snackBar.open('ID do produto inválido para exclusão.', 'Fechar', { duration: 3000 });
        return;
    }
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.api.deleteProduct(id_produto).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso!', 'Fechar', { duration: 3000 });
          if (this.editingProductId === id_produto) {
            this.resetForm();
          }
          this.loadInitialData(); // Recarrega tudo
        },
        error: (err) => this.handleApiError(err, 'excluir')
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.editingProductId = null;
    Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.setErrors(null);
        this.productForm.get(key)?.markAsUntouched();
        this.productForm.get(key)?.markAsPristine();
    });
  }

  getSupplierName(cpf_cnpj: string): string {
    const supplier = this.suppliers.find(s => s.cpf_cnpj_fornecedor === cpf_cnpj);
    return supplier?.nome_fornecedor || cpf_cnpj; // Retorna o nome do fornecedor ou o CPF/CNPJ como fallback
  }
}