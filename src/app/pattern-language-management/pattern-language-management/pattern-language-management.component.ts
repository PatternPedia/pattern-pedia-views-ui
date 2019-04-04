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

import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import PatternLanguage from '../../core/model/pattern-language.model';
import { PatternOntologyService } from '../../core/service/pattern-ontology.service';
import { LoaderRegistryService } from '../../core/service/loader/pattern-language-loader/loader-registry.service';
import { ActivatedRoute, Router } from '@angular/router';
import { globals } from '../../globals';

@Component({
    selector: 'pp-pattern-language-management',
    templateUrl: './pattern-language-management.component.html',
    styleUrls: ['./pattern-language-management.component.scss']
})
export class PatternLanguageManagementComponent implements OnInit {

    // NOTE: These are currently the config params
    private urlPatternPedia = globals.urlPatternRepoOntology;
    private patternPediaInstance = globals.iriPatternRepoInstance;
    private loadLocally = globals.loadOntologyLocally;

    patternLanguages: Array<PatternLanguage>;

    constructor(private pos: PatternOntologyService,
                private cdr: ChangeDetectorRef,
                private lr: LoaderRegistryService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private zone: NgZone) {
    }

    ngOnInit() {
        this.patternLanguages = Array.from<PatternLanguage>(this.activatedRoute.snapshot.data.patternlanguages.values())
            .sort((pl1: PatternLanguage, pl2: PatternLanguage) => {
                if (pl1.name > pl2.name) {
                    return 1;
                }
                if (pl1.name < pl2.name) {
                    return -1;
                }
                return 0;
            });
    }

    loadLocallyHostedOntos(): void {
        this.pos.loadLocallyHostedOntos()
            .subscribe(() => {
                this.lr.getContentLoader<PatternLanguage>(this.patternPediaInstance)
                    .loadContentFromStore()
                    .subscribe(async (languages) => {
                        this.patternLanguages = await Array.from<PatternLanguage>(languages.values())
                            .sort((pl1: PatternLanguage, pl2: PatternLanguage) => {
                                if (pl1.name > pl2.name) {
                                    return 1;
                                }
                                if (pl1.name < pl2.name) {
                                    return -1;
                                }
                                return 0;
                            });
                        this.cdr.detectChanges();
                    });
            });
    }

    loadPatternPedia(): void {
        this.pos.loadOntologyWithImportsToStore(this.urlPatternPedia)
            .subscribe(() => {
                // Todo: here we go wit this.pll
                this.lr.getContentLoader<PatternLanguage>(this.patternPediaInstance)
                    .loadContentFromStore()
                    .subscribe(async (result) => {
                        this.patternLanguages = Array.from(result.values());
                        this.cdr.detectChanges();
                    });
            }, error1 => console.error(error1));
    }

    reloadPatternRepo() {
        this.loadLocally ? this.loadLocallyHostedOntos() : this.loadPatternPedia();
    }

    navigateToPL(id: string): void {
        this.zone.run(() => {
            this.router.navigate([id], {relativeTo: this.activatedRoute});
        });
    }

    // TODO: Move this to patternlanguage rendering component for adding pattern individuals not pl individuals
    addPatternLanguageIndividual(): void {
        this.pos.insertNewPatternLanguageIndividual(null)
            .subscribe(() => this.ngOnInit());
    }
}