import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {globals} from '../../globals';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private repoEndpoint = globals.repoEndpoint;

  constructor(private http: HttpClient) {
  }

  getImageById(id: String): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    const url = this.repoEndpoint + '/getImageById/' + id;
    console.log('URL' + url);
    return this.http.get<String>(url, {headers, responseType: 'text'});
  }
}