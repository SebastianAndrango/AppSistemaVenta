import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Venta } from 'src/app/interfaces/venta';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';

@Component({
  selector: 'app-modal-detalle-venta',
  templateUrl: './modal-detalle-venta.component.html',
  styleUrls: ['./modal-detalle-venta.component.css']
})
export class ModalDetalleVentaComponent implements OnInit {

  fechaRegistro: string = '';
  numeroDocumento: string = '';
  tipoPago : string = '';
  total: string = '';
  detalleVenta: DetalleVenta[] = [];
  columnasTabla: string[] = ['producto', 'cantidad', 'precio', 'total'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataVenta: Venta

  ) {
    this.fechaRegistro = dataVenta.fechaRegistro!;
    this.numeroDocumento = dataVenta.numeroDocumento!;
    this.tipoPago = dataVenta.tipoPago;
    this.total = dataVenta.totalTexto;
    this.detalleVenta = dataVenta.detalleVenta;
  }

  ngOnInit(): void {
  }

}
