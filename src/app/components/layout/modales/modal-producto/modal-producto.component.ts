import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categoria } from 'src/app/interfaces/categoria';
import { Producto } from 'src/app/interfaces/producto';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ProductoService } from 'src/app/services/producto.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.css'],
})
export class ModalProductoComponent implements OnInit {
  formularioProducto: FormGroup;
  tituloAccion: string = 'Agregar';
  botonAccion: string = 'Guardar';
  listaCategorias: Categoria[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private utilidadService: UtilidadService,
    private modalActual: MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosProducto: Producto,
    private categoriaService: CategoriaService,
    private productoService: ProductoService
  ) {
    this.formularioProducto = this.formBuilder.group({
      nombre: ['', Validators.required],
      idCategoria: ['', Validators.required],
      stock: ['', Validators.required],
      precio: ['', Validators.required],
      esActivo: ['1', Validators.required],
    });
    if (this.datosProducto != null) {
      this.tituloAccion = 'Editar';
      this.botonAccion = 'Actualizar';
    }
    this.categoriaService.listar().subscribe({
      next: (data) => {
        if (data.status) {
          this.listaCategorias = data.value;
          console.log(data.value);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ngOnInit(): void {
    if (this.datosProducto != null) {
      this.formularioProducto.setValue({
        nombre: this.datosProducto.nombre,
        idCategoria: this.datosProducto.idCategoria,
        stock: this.datosProducto.stock,
        precio: this.datosProducto.precio,
        esActivo: this.datosProducto.esActivo.toString(),
      });
    }
  }

  guardarEditarProducto() {
    if (this.formularioProducto.valid) {
      const precioInput = this.formularioProducto.value.precio;
      // Reemplazar punto por coma en el precio
      const nuevoPrecio =
        typeof precioInput === 'string'
          ? precioInput.replace('.', ',')
          : precioInput;
      const producto: Producto = {
        idProducto:
          this.datosProducto != null ? this.datosProducto.idProducto : 0,
        nombre: this.formularioProducto.value.nombre,
        idCategoria: this.formularioProducto.value.idCategoria,
        descripcionCategoria: '',
        stock: this.formularioProducto.value.stock,
        precio: nuevoPrecio,
        esActivo: parseInt(this.formularioProducto.value.esActivo),
      };
      if (this.datosProducto == null) {
        this.productoService.guardar(producto).subscribe({
          next: (data) => {
            if (data.status) {
              this.utilidadService.mostrarAlerta(
                'El producto fue registrado',
                'Éxito'
              );
              this.modalActual.close(data.status);
            } else {
              this.utilidadService.mostrarAlerta(
                'No se pudo registrar el producto',
                'Error'
              );
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
      } else {
        producto.idProducto = this.datosProducto.idProducto;
        this.productoService.editar(producto).subscribe({
          next: (data) => {
            if (data.status) {
              this.utilidadService.mostrarAlerta(
                'El producto fue actualizado',
                'Éxito'
              );
              this.modalActual.close('true');
            } else {
              this.utilidadService.mostrarAlerta(
                'No se pudo actualizar el producto',
                'Error'
              );
            }
          },
          error: (e) => {
            console.log(e);
          },
        });
      }
    }
  }
}
