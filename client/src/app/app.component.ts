import { Component, Injectable, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from './services/user.service';
import { NotificationService } from './services/notification.service';
import { Notification } from './models/notification';
import { GLOBAL } from './services/global';
import { Publication } from './models/publication';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
    './components/preloader/preloader.component.scss'
  ],
  providers: [UserService, NotificationService]
})
@Injectable()
export class AppComponent implements OnInit, DoCheck {
  public title: String;
  public identity: Boolean;
  public loading: Boolean;
  public url: String;
  public token;
  public status: String;
  public page;
  public total;
  public pages;
  public itemsPerPage;
  public notifications: Notification[];
  public unviewedNotifications;
  constructor(
    private _userService: UserService,
    private _notificationService: NotificationService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    this.token = this._userService.getToken();
    this.loading = false;
    this.title = 'Adagio';
    this.url = GLOBAL.url;
    this.page = 1;
  }
  ngOnInit() {
    this.identity = this._userService.getIdentity();
    console.log(this.identity);
    this.getUnviewedNotifications();
    this.getNotifications(this.page);
  }

  ngDoCheck() {
    this.identity = this._userService.getIdentity();
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

  dimissThisNotification(notification_id) {
    this._notificationService.dimissNotification(this.token, notification_id).subscribe(
      response => {
        console.log('Dimissing Notification', notification_id);
        this.getUnviewedNotifications();
        this.getNotifications(this.page);
      }
    );
  }

  logout() {
    localStorage.clear();
    this.identity = null;
    this._router.navigate(['/']);
  }
}
