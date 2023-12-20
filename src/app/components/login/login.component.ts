import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from 'src/app/interfaces/login';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formularioLogin: FormGroup;
  ocultarPassword: boolean = true;
  mostrarLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private utilidadService: UtilidadService
  ) {
    this.formularioLogin = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
   }

  ngOnInit(): void {
  }

  iniciarSesion(){
    this.mostrarLoading = true;
    const request: Login = {
      correo: this.formularioLogin.value.email,
      clave: this.formularioLogin.value.password
    }
    this.usuarioService.iniciarSesion(request).subscribe({
      next: (data) => {
        if(data.status){
          this.utilidadService.guardarSesionUsuario(data.value);
          this.router.navigate(['pages']);
        }else{
          this.utilidadService.mostrarAlerta('No se encontraron coincidencias', 'Error');
        }
      },
      complete: () => {
        this.mostrarLoading = false;
      },
      error: () => {
        this.utilidadService.mostrarAlerta('Hubo un error en el servicio', 'Error');
        this.mostrarLoading = false;
      }
    }
    );
  }

}
