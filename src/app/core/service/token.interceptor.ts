import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, pipe, throwError } from 'rxjs';
import { filter, retryWhen, switchMap, take, delay } from 'rxjs/operators';
// import { AuthenticationService } from './authentication.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    // intercept(req: HttpRequest<any>, next: HttpHandler) {
    //     if (true && req.url.indexOf('basicauth') === -1) {
    //         const authReq = req.clone({
    //             headers: new HttpHeaders({
    //                 'Content-Type': 'application/json',
    //                 'Authorization': 'Basic' + btoa("user" + ":" + "pass")
    //             })
    //         });
    //         return next.handle(authReq);
    //     } else {
    //         return next.handle(req);
    //     }
    // }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // const xhr = req.clone({
        //     headers: req.headers.set('X-Requested-With', 'XMLHttpRequest',  )
        // });
        return next.handle(req);
    }



    //   private static authService: AuthenticationService = null;
    //   static init(authService: AuthenticationService) {
    //     console.log(`interceptor initialized`);
    //     this.authService = authService;
    //   }

    //   constructor() { }

    //   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //     if (TokenInterceptor.authService === null || !TokenInterceptor.authService.interceptUrl(req)) {
    //       console.log(`skip token interceptor for ${req.urlWithParams}`);
    //       return next.handle(req);
    //     }
    //     console.log(`intercept ${req.urlWithParams}`);
    //     let retryCount = 0;
    //     return TokenInterceptor.authService.accessToken$.pipe(
    //       filter(token => { console.log('skipped token null'); return !!token; }),
    //       take(1),
    //       // delay(3000),
    //       switchMap(token => {
    //         console.log(`add access token to ${req.urlWithParams}`);
    //         return next.handle(this.addToken(req, token));
    //       }),
    //       // retry 1 time in case of 401 errors, in case the token expires between the expiration check and the http call
    //       retryWhen(pipe(switchMap(err => err instanceof HttpErrorResponse && (<HttpErrorResponse>err).status === 401
    //         && retryCount++ < 2 ? of(err) : throwError(err)))),
    //     );
    //   }

    //   private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    //     return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    //   }

}
