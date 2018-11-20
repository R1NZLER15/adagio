import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Student } from '../../models/student';
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
  public student: Student;
  public status: String;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
    /*,
        private _userService: UserService*/
  ) {
    this.title = 'Registro';
    this.user = new User(
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    );
    this.student = new Student(
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    );
  }

  ngOnInit() {
    console.log('Registro cargado...');
  }
  onSubmit(form) {
    const input = $.extend(this.user, this.student);
    console.log(this.user, this.student);
    this._userService.register(input).subscribe(
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
}
