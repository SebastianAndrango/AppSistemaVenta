import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';
import { ModalDetalleVentaComponent } from '../../modales/modal-detalle-venta/modal-detalle-venta.component';
import { Venta } from 'src/app/interfaces/venta';
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
  selector: 'app-historial-venta',
  templateUrl: './historial-venta.component.html',
  styleUrls: ['./historial-venta.component.css'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATA_FORMATS }],
})
export class HistorialVentaComponent implements OnInit, AfterViewInit {
  formularioBusqueda: FormGroup;
  opcionesBusqueda: any[] = [
    { value: 'fecha', descripcion: 'Por fechas' },
    { value: 'numero', descripcion: 'Numero venta' },
  ];
  columnasTabla: string[] = [
    'fechaRegistro',
    'numeroDocumento',
    'tipoPago',
    'total',
    'accion',
  ];
  dataInicio: Venta[] = [];
  datosListaVenta = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private ventaService: VentaService,
    private utilidadService: UtilidadService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.formularioBusqueda = this.formBuilder.group({
      buscarPor: ['fecha'],
      numero: [''],
      fechaInicio: [''],
      fechaFin: [''],
    });

    this.formularioBusqueda.get('buscarPor')?.valueChanges.subscribe((data) => {
      this.formularioBusqueda.patchValue({
        numero: '',
        fechaInicio: '',
        fechaFin: '',
      });
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.datosListaVenta.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const textoFiltro = (event.target as HTMLInputElement).value;
    this.datosListaVenta.filter = textoFiltro.trim().toLocaleLowerCase();
  }

  buscarVentas() {
    let fechaInicio: string = '';
    let fechaFin: string = '';

    if (this.formularioBusqueda.value.buscarPor === 'fecha') {
      fechaInicio = moment(this.formularioBusqueda.value.fechaInicio).format(
        'DD/MM/YYYY'
      );
      fechaFin = moment(this.formularioBusqueda.value.fechaFin).format(
        'DD/MM/YYYY'
      );

      if (fechaInicio === 'Invalid date' || fechaFin === 'Invalid date') {
        this.utilidadService.mostrarAlerta(
          'Ingrese ambas fechas válidas',
          'Error'
        );
        return;
      }
    }

    this.ventaService
      .historial(
        this.formularioBusqueda.value.buscarPor,
        this.formularioBusqueda.value.numero,
        fechaInicio,
        fechaFin
      )
      .subscribe({
        next: (data) => {
          if (data.status) {
            this.datosListaVenta = data.value;
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

  verDetalleVenta(venta: Venta) {
    this.dialog
      .open(ModalDetalleVentaComponent, {
        disableClose: true,
        data: venta,
        width: '700px',
      })
  }
}
