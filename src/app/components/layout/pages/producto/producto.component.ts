import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalProductoComponent } from '../../modales/modal-producto/modal-producto.component';
import { Producto } from 'src/app/interfaces/producto';
import { ProductoService } from 'src/app/services/producto.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = [
    'nombre',
    'categoria',
    'stock',
    'precio',
    'estado',
    'acciones',
  ];
  dataInicio: Producto[] = [];
  dataListaProductos = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productoService: ProductoService,
    private utilidadService: UtilidadService,
    private dialog: MatDialog
  ) { }

  obtenerProductos() {
    this.productoService.listar().subscribe({
      next: (data) => {
        if (data.status) {
          this.dataListaProductos.data = data.value;
          console.log(this.dataListaProductos.data);
        } else {
          this.utilidadService.mostrarAlerta(
            'No se encontraron datos',
            'Error'
          );
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  ngAfterViewInit(): void {
    this.dataListaProductos.paginator = this.paginator;
  }

  aplicarFiltroTabla(event: Event) {
    const textoFiltro = (event.target as HTMLInputElement).value;
    this.dataListaProductos.filter = textoFiltro.trim().toLocaleLowerCase();
  }

  nuevoProducto() {
    this.dialog
      .open(ModalProductoComponent, {
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result == true) {
          this.obtenerProductos();
        }
      });
  }

  editarProducto(producto: Producto) {
    this.dialog
      .open(ModalProductoComponent, {
        disableClose: true,
        data: producto,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result == 'true') {
          this.obtenerProductos();
        }
      });
  }

  eliminarProducto(producto: Producto) {
    Swal.fire({
      title: '¿Está seguro de eliminar el producto?',
      text: producto.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Si, eliminar',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminar(producto.idProducto).subscribe({
          next: (data) => {
            if (data.status) {
              this.utilidadService.mostrarAlerta('El producto fue eliminado', 'Listo');
              this.obtenerProductos();
            } else {
              this.utilidadService.mostrarAlerta(
                'No se pudo eliminar el producto',
                'Error'
              );
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    });
  }

}
