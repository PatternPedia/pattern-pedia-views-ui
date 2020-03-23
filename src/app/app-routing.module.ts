import {PatternLanguageGraphComponent} from './pattern-language-management/pattern-language-graph/pattern-language-graph.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageNotFoundComponent} from './page-not-found.component';
import {ProcessOauthCallbackComponent} from './core/component/process-oauth-callback/process-oauth-callback.component';
import {ToasterModule} from 'angular2-toaster';
import { LoginComponent } from './core/component/login/login.component';
/*
 * Copyright (c) 2018 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */

const routes: Routes = [
    {
        path: 'oauth-callback',
        component: ProcessOauthCallbackComponent
    }, {
        path: '',
        redirectTo: 'patternlanguages',
        pathMatch: 'full'
    },
    {
        path: 'graph',
        component: PatternLanguageGraphComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: false, onSameUrlNavigation: 'reload'}), ToasterModule.forRoot()],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
