import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {
  public title: String;
  public user: User;
  public status: String;
  public identity;
  public token;
  public page;
  public total;
  public pages;
  public itemsPerPage;
  public notifications: Notification[];
  public unviewedNotifications;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _notificationService: NotificationService,
  ) {
    this.title = 'Inicia sesión';
    this.user = new User(
      '', '', '', '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '', '', ''
    );

  }

  ngOnInit() {
    console.log('Login cargado...');
  }

  onSubmit() {
    this._userService.login(this.user).subscribe(
      response => {
        this.identity = response.user;
        console.log(this.identity);
        if (!this.identity || !this.identity._id) {
          this.status = 'error';
        } else {
          localStorage.setItem('identity', JSON.stringify(this.identity));
          this.getToken();
        }
      },
      error => {
        const errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }


  getToken() {
    this._userService.login(this.user, 'true').subscribe(
      response => {
        this.token = response.token;
        if (this.token.length <= 0) {
          this.status = 'error';
        } else {
          localStorage.setItem('token', this.token);
          this.getCounters();
        }
      },
      error => {
        const errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }

  getCounters() {
    this._userService.getCounters().subscribe(
      response => {
        localStorage.setItem('stats', JSON.stringify(response));
        this.status = 'success';
        this.getUnviewedNotifications();
        this.getNotifications(this.page);
        this._router.navigate(['/']);
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  getUnviewedNotifications() {
    if (this.identity != null) {
      this._notificationService.getUnviewedNotifications(this.token).subscribe(
        response => {
          this.unviewedNotifications = response.notifications;
        }
      );
    }
  }
  
  getNotifications(page, adding = false) {
    if (this.identity != null) {
      this._notificationService.getNotifications(this.token, page).subscribe(
        response => {
          if (response.notifications) {
            this.total = response.total;
            this.pages = response.pages;
            this.itemsPerPage = response.items_per_page;
  
            if (!adding) {
              this.notifications = response.notifications;
              console.log(this.total);
            } else {
              const arrayA = this.notifications;
              const arrayB = response.notifications;
              this.notifications = arrayA.concat(arrayB);
              $('html, body');
            }
            if (page > this.pages) {
            }
          } else {
            this.status = 'error';
          }
        }
      );
    }
  }
  
}