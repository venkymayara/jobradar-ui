import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type ApiParamValue = string | number | boolean | readonly (string | number)[] | null | undefined;
export type ApiQueryParams = object;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  get<T>(path: string, params?: ApiQueryParams, withCredentials = false): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.toHttpParams(params), withCredentials });
  }

  post<TResponse, TBody = unknown>(path: string, body: TBody, params?: ApiQueryParams, withCredentials = false): Observable<TResponse> {
    return this.http.post<TResponse>(this.url(path), body, { params: this.toHttpParams(params), withCredentials });
  }

  put<TResponse, TBody = unknown>(path: string, body: TBody, params?: ApiQueryParams): Observable<TResponse> {
    return this.http.put<TResponse>(this.url(path), body, { params: this.toHttpParams(params) });
  }

  patch<TResponse, TBody = unknown>(path: string, body: TBody, params?: ApiQueryParams): Observable<TResponse> {
    return this.http.patch<TResponse>(this.url(path), body, { params: this.toHttpParams(params) });
  }

  delete<TResponse = void>(path: string, params?: ApiQueryParams): Observable<TResponse> {
    return this.http.delete<TResponse>(this.url(path), { params: this.toHttpParams(params) });
  }

  private url(path: string): string { return `${this.baseUrl}/${path.replace(/^\/+/, '')}`; }

  private toHttpParams(values?: ApiQueryParams): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values ?? {}) as [string, ApiParamValue][]) {
      if (value === null || value === undefined || value === '') continue;
      for (const item of Array.isArray(value) ? value : [value]) params = params.append(key, String(item));
    }
    return params;
  }
}
