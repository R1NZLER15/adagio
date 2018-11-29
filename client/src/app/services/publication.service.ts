import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { Publication } from '../models/publication';

@Injectable()
export class PublicationService {
  public url: String;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  savePublication(token, publication): Observable<any> {
    const params = JSON.stringify(publication);
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.post(this.url + 'save-publication/', params, {headers: headers});
  }

  getPublication(token, publication_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'publication/' + publication_id, {headers: headers});
  }

  getPublications(token, page = 1): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'publications/' + page, {headers: headers});
  }

  getFollowedPublications(token, page = 1): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'followed-publications/' + page, {headers: headers});
  }

  getUserPublications(token, user_id, page = 1): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.get(this.url + 'user-publications/' + user_id + '/' + page, {headers: headers});
  }

  deletePublication(token, publication_id): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);
    return this._http.delete(this.url + 'delete-publication/' + publication_id, {headers: headers});
  }
}
