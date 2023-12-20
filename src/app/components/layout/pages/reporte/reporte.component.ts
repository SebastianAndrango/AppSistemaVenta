import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { Reporte } from 'src/app/interfaces/reporte';
import { VentaService } from 'src/app/services/venta.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';

export const MY_DATA_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATA_FORMATS }],
})
export class ReporteComponent implements OnInit, AfterViewInit {
  formularioFiltro: FormGroup;
  listaVentasReporte: Reporte[] = [];
  columnasTabla: string[] = [
    'fechaRegistro',
    'numeroVenta',
    'tipoPago',
    'total',
    'producto',
    'cantidad',
    'precio',
    'totalProducto',
  ];
  dataVentaReporte = new MatTableDataSource(this.listaVentasReporte);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private ventaService: VentaService,
    private utilidadService: UtilidadService,
    private formBuilder: FormBuilder
  ) {
    this.formularioFiltro = this.formBuilder.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataVentaReporte.paginator = this.paginacionTabla;
  }

  buscarVentas() {
    const fechaInicio = moment(this.formularioFiltro.value.fechaInicio).format(
      'DD/MM/YYYY'
    );
    const fechaFin = moment(this.formularioFiltro.value.fechaFin).format(
      'DD/MM/YYYY'
    );

    if (fechaInicio === 'Invalid date' || fechaFin === 'Invalid date') {
      this.utilidadService.mostrarAlerta(
        'Ingrese ambas fechas válidas',
        'Error'
      );
      return;
    }

    this.ventaService.reporte(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        console.log(fechaFin);
        console.log(fechaInicio);
        console.log(data);
        if (data.status) {
          this.listaVentasReporte = data.value;
          this.dataVentaReporte.data = data.value;
          console.log(this.listaVentasReporte);
        } else {
          this.listaVentasReporte = [];
          this.dataVentaReporte.data = [];
          this.utilidadService.mostrarAlerta(
            'No se encontraron datos',
            'Error'
          );
        }
      },
    });
  }

  exportarExcel(){
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.listaVentasReporte);

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, 'Reporte.xlsx');
  }
}
