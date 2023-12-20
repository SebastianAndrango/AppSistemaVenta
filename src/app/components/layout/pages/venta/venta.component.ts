import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/services/producto.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import { VentaService } from 'src/app/services/venta.service';
import { Producto } from 'src/app/interfaces/producto';
import { Venta } from 'src/app/interfaces/venta';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export class VentaComponent implements OnInit {
  listaProductos: Producto[] = [];
  listaProductosFiltro: Producto[] = [];

  listaProductosParaVenta: DetalleVenta[] = [];
  bloquearBotonRegistrar: boolean = false;

  productoSeleccionado!: Producto;
  tipoDePagoPorDefecto: string = 'Efectivo';
  totalPagar: number = 0;

  formularioProductoVenta: FormGroup;
  columnasTabla: string[] = [
    'producto',
    'cantidad',
    'precio',
    'total',
    'accion',
  ];
  datosDetalleVenta = new MatTableDataSource<DetalleVenta>(
    this.listaProductosParaVenta
  );

  retornarProductosPorFiltro(busqueda: any): Producto[] {
    const valorBuscado =
      typeof busqueda === 'string'
        ? busqueda.toLowerCase()
        : busqueda.nombre.toLowerCase();
    return this.listaProductos.filter((producto) =>
      producto.nombre.toLowerCase().includes(valorBuscado)
    );
  }

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private formBuilder: FormBuilder,
    private utilidadService: UtilidadService
  ) {
    this.formularioProductoVenta = this.formBuilder.group({
      producto: ['', Validators.required],
      cantidad: ['', Validators.required],
      tipoDePago: [this.tipoDePagoPorDefecto, Validators.required],
    });
    this.productoService.listar().subscribe({
      next: (data) => {
        if (data.status) {
          const lista = data.value as Producto[];
          this.listaProductos = lista.filter(
            (producto) => producto.esActivo == 1 && producto.stock > 0
          );
        }
      },
      error: (error) => {
        console.log(error);
      },
    });

    this.formularioProductoVenta
      .get('producto')
      ?.valueChanges.subscribe((value) => {
        this.listaProductosFiltro = this.retornarProductosPorFiltro(value);
      });
  }

  ngOnInit(): void {}

  mostrarProducto(producto: Producto): string {
    return producto.nombre;
  }

  productoParaVenta(event: any) {
    this.productoSeleccionado = event.option.value;
  }

  agregarProductoParaVenta() {
    const cantidad: number = this.formularioProductoVenta.value.cantidad;
    const precio: number = parseFloat(this.productoSeleccionado.precio);
    const total: number = cantidad * precio;
    this.totalPagar += total;
    this.listaProductosParaVenta.push({
      idProducto: this.productoSeleccionado.idProducto,
      descripcionProducto: this.productoSeleccionado.nombre,
      cantidad: cantidad,
      //precioTexto: String(precio.toFixed(2)),
      precioTexto: precio.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
      //totalTexto: String(total.toFixed(2)),
      totalTexto: total.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
    });
    this.datosDetalleVenta = new MatTableDataSource(
      this.listaProductosParaVenta
    );
    this.formularioProductoVenta.patchValue({
      producto: '',
      cantidad: '',
    });
  }

  eliminarProducto(detalle: DetalleVenta) {
    this.totalPagar -= parseFloat(detalle.totalTexto);
    this.listaProductosParaVenta = this.listaProductosParaVenta.filter(
      (p) => p.idProducto != detalle.idProducto
    );
    this.datosDetalleVenta = new MatTableDataSource(
      this.listaProductosParaVenta
    );
  }

  registrarVenta() {
    if (this.listaProductosParaVenta.length > 0) {
      this.bloquearBotonRegistrar = true;
      const request: Venta = {
        tipoPago: this.tipoDePagoPorDefecto,
        totalTexto: this.totalPagar.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
        detalleVenta: this.listaProductosParaVenta,
      };
      //console.log("el request: "+ JSON.stringify(request));
      this.ventaService.registrar(request).subscribe({
        next: (data) => {
          //console.log(data.value);
          if (data.status) {
            //console.log(data.value);
            this.totalPagar = 0;
            this.bloquearBotonRegistrar = false;
            this.listaProductosParaVenta = [];
            this.datosDetalleVenta = new MatTableDataSource(
              this.listaProductosParaVenta
            );
            Swal.fire({
              icon: 'success',
              title: 'Venta registrada!',
              text: `Numero de venta ${data.value.numeroDocumento}`,
            });
          } else {
            this.utilidadService.mostrarAlerta(
              'No se pudo registrar la venta',
              'Error'
            );

          }
        },
        complete: () => {
          this.bloquearBotonRegistrar = false;
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }
}
