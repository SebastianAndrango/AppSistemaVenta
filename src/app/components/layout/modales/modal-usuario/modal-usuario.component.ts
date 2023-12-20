import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { Rol } from 'src/app/interfaces/rol';
import { Usuario } from 'src/app/interfaces/usuario';
import { RolService } from 'src/app/services/rol.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css'],
})
export class ModalUsuarioComponent implements OnInit {
  formularioUsuario: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = 'Agregar';
  botonAccion: string = 'Guardar';
  listaRoles: Rol[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private formBuilder: FormBuilder,
    private utilidadService: UtilidadService,
    private modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public dataUsuario: Usuario
  ) {
    this.formularioUsuario = this.formBuilder.group({
      nombreCompleto: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      idRol: ['', Validators.required],
      clave: ['', Validators.required],
      esActivo: ['1', Validators.required],
    });
    if (this.dataUsuario != null) {
      this.tituloAccion = 'Editar';
      this.botonAccion = 'Actualizar';
    }
    this.rolService.listar().subscribe({
      next: (data) => {
        if (data.status) {
          this.listaRoles = data.value;
          console.log(data.value);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ngOnInit(): void {
    if (this.dataUsuario != null) {
      this.formularioUsuario.setValue({
        nombreCompleto: this.dataUsuario.nombreCompleto,
        correo: this.dataUsuario.correo,
        idRol: this.dataUsuario.idRol,
        clave: this.dataUsuario.clave,
        esActivo: this.dataUsuario.esActivo.toString(),
      });
    }
  }

  guardarEditarUsuario() {
    const usuario: Usuario = {
      idUsuario: this.dataUsuario != null ? this.dataUsuario.idUsuario : 0,
      nombreCompleto: this.formularioUsuario.value.nombreCompleto,
      correo: this.formularioUsuario.value.correo,
      idRol: this.formularioUsuario.value.idRol,
      rolDescripcion: '',
      clave: this.formularioUsuario.value.clave,
      esActivo: parseInt(this.formularioUsuario.value.esActivo),
    };

    if (this.dataUsuario == null) {
      this.usuarioService.guardar(usuario).subscribe({
        next: (data) => {
          if (data.status) {
            this.utilidadService.mostrarAlerta("El usuario fue registrado", "Exito");
            this.modalActual.close("true");
          } else {
            this.utilidadService.mostrarAlerta("No se pudo registrar el usuario", "Error");
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.usuarioService.editar(usuario).subscribe({
        next: (data) => {
          if (data.status) {
            this.utilidadService.mostrarAlerta("El usuario fue actualizado", "Exito");
            this.modalActual.close("true");
          } else {
            this.utilidadService.mostrarAlerta("No se pudo actualizar el usuario", "Error");
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }
}
