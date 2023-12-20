import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'src/app/interfaces/menu';
import { MenuService } from 'src/app/services/menu.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  listaMenus: Menu[] = [];
  correoUsuario: string = '';
  rolUsuario: string = '';

  constructor(
    private menuService: MenuService,
    private utilidadService: UtilidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.utilidadService.obtenerSesionUsuario();
    if (usuario != null) {
      this.correoUsuario = usuario.correo;
      this.rolUsuario = usuario.rolDescripcion;

      this.menuService.listar(usuario.idUsuario).subscribe({
        next: (data) => {
          if (data.status) {
            this.listaMenus = data.value;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  cerrarSesion(): void {
    this.utilidadService.eliminarSesionUsuario();
    this.router.navigate(['login']);
  }
}
