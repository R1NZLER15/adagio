import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public title: String;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.title = 'Inicia sesión';
  }

  ngOnInit() {
    console.log('Login cargado...');
  }
}
