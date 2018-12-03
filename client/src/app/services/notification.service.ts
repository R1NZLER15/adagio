import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { Notification } from '../models/notification';

@Injectable()
export class NotificationService {
  public url: String;
  constructor(
      private _http: HttpClient
  ) {
      this.url = GLOBAL.url;
  }
  getNotifications(token, page): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'notifications/' + page, {headers: headers});
  }
  getUnviewedNotifications(token): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'unviewed-notifications/', {headers: headers});
  }
  dimissNotification(token, notification_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'dimiss-notification/' + notification_id, {headers: headers});
  }
}
