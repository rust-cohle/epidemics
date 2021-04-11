import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ResourceCreated {
  resource: { uuid: string };
}

@Injectable({
  providedIn: 'root'
})
export class RestService {
  constructor(private http: HttpClient) {}

  getResource(uuid: string): Observable<HttpEvent<any>> {
    return this.http.get(`http://localhost:3334/api/resource/${uuid}`, {
      headers: {
        "Content-Type": "application/json"
      },
      reportProgress: true,
      observe: "events",
      responseType: "json"
    });
  }
}
