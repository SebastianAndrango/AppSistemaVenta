import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalUsuarioComponent } from '../../modales/modal-usuario/modal-usuario.component';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
})
export class UsuarioComponent implements OnInit, AfterViewInit {
  columnasTabla: string[] = [
    'nombreCompleto',
    'correo',
    'rolDescripcion',
    'estado',
    'acciones',
  ];
  dataInicio: Usuario[] = [];
  dataListaUsuarios = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private usuarioService: UsuarioService,
    private utilidadService: UtilidadService,
    private dialog: MatDialog
  ) {}

  obtenerUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (data) => {
        if (data.status) {
          this.dataListaUsuarios.data = data.value;
          console.log(this.dataListaUsuarios.data);
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
    this.obtenerUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataListaUsuarios.paginator = this.paginator;
  }

  aplicarFiltroTabla(event: Event) {
    const textoFiltro = (event.target as HTMLInputElement).value;
    this.dataListaUsuarios.filter = textoFiltro.trim().toLocaleLowerCase();
  }

  nuevoUsuario() {
    this.dialog
      .open(ModalUsuarioComponent, {
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result == 'true') {
          this.obtenerUsuarios();
        }
      });
  }

  editarUsuario(usuario: Usuario) {
    this.dialog
      .open(ModalUsuarioComponent, {
        disableClose: true,
        data: usuario,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result == 'true') {
          this.obtenerUsuarios();
        }
      });
  }

  eliminarUsuario(usuario: Usuario) {
    Swal.fire({
      title: '¿Está seguro de eliminar el usuario?',
      text: usuario.nombreCompleto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Si, eliminar',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminar(usuario.idUsuario).subscribe({
          next: (data) => {
            if (data.status) {
              this.utilidadService.mostrarAlerta('El usuario fue eliminado', 'Listo');
              this.obtenerUsuarios();
            } else {
              this.utilidadService.mostrarAlerta(
                'No se pudo eliminar el usuario',
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
