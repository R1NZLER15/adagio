import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  public title: String;
  public user: User;
  public status: String;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = 'Registro';
    this.user = new User(
      '', '', '', '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '', '', ''
    );
  }

  ngOnInit() {
    console.log('Registro cargado...');
  }
  onSubmit(form) {
    this._userService.register(this.user).subscribe(
      response => {
        if (response.user && response.user._id) {
          this.status = 'success';
          form.reset();
          console.log(response);
        } else {
          this.status = 'error';
          console.log('ERROR');
        }
      },
      error => {
        this.status = 'error';
        console.log(<any>error);
      }
    );
  }

  login() {
    this._router.navigate(['/login']);
  }
}
