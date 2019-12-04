import {AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AddToViewComponent, LinksToOtherPattern, LoazyLoadedFlatNode} from '../add-to-view/add-to-view.component';
import {PatternLanguageService} from '../../core/service/pattern-language.service';
import PatternLanguage from '../../core/model/hal/pattern-language.model';
import {EMPTY, forkJoin, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {ToasterService} from 'angular2-toaster';
import {PatternViewService} from '../../core/service/pattern-view.service';
import Pattern from '../../core/model/hal/pattern.model';
import {PatternView} from '../../core/model/hal/pattern-view.model';
import {UriConverter} from '../../core/util/uri-converter';
import {ActivatedRoute} from '@angular/router';
import {PatternService} from '../../core/service/pattern.service';
import {CreatePatternRelationComponent} from '../../core/component/create-pattern-relation/create-pattern-relation.component';
import {DirectedEdgeModel} from '../../core/model/hal/directed-edge.model';
import {HalLink} from '../../core/model/hal/hal-link.interface';

@Component({
    selector: 'pp-pattern-view-renderer',
    templateUrl: './pattern-view-renderer.component.html',
    styleUrls: ['./pattern-view-renderer.component.scss']
})
export class PatternViewRendererComponent implements OnInit, AfterViewInit {

    private patternLanguages: PatternLanguage[];
    patternViewResponse: PatternView;
    patterns: Pattern[] = [];
    displayText: string;
    private patternViewUri: string;
    isLoading = true;
    trigger;


    constructor(private matDialog: MatDialog, private patternLanguageService: PatternLanguageService, private patternViewService: PatternViewService,
                private patternService: PatternService, private toasterService: ToasterService, private cdr: ChangeDetectorRef,
                private activatedRoute: ActivatedRoute, private applicationRef: ApplicationRef) {
    }

    ngOnInit() {


    }

    ngAfterViewInit(): void {
        this.patternViewUri = UriConverter.doubleDecodeUri(this.activatedRoute.snapshot.paramMap.get('patternViewUri'));

        this.getData().subscribe(() => {
                this.isLoading = false;
                this.displayText = this.patternViewResponse.name;
            },
            (error => this.toasterService.pop('error', 'Could not load data')));
    }

    addPatternToView() {
        const dialogRef = this.matDialog.open(AddToViewComponent, {data: {patternlanguages: this.patternLanguages, title: 'Add patterns to View'}});
        dialogRef.afterClosed().pipe(
            switchMap((res: LoazyLoadedFlatNode[]) => res ?
                this.patternViewService.addPatterns(this.patternViewResponse._links.patterns.href, this.mapDialogResultToPatterns(res))
                : EMPTY),
            switchMap(result => result ? this.getCurrentPatternViewAndPatterns() : EMPTY)).subscribe((res) => {
            if (res) {
                this.toasterService.pop('success', 'Data added');
                this.cdr.detectChanges();
            }
        });
    }

    private getPatternLanguages(): Observable<PatternLanguage[]> {
        return this.patternLanguageService.getPatternLanguages().pipe(tap(patternlanguages => this.patternLanguages = patternlanguages));
    }

    private getCurrentPatternViewAndPatterns(): Observable<Pattern[]> {
        return this.patternViewService.getPatternViewByUri(this.patternViewUri).pipe(
            tap(patternViewResponse => {
                this.patternViewResponse = patternViewResponse;
            }),
            switchMap((patternViewResponse: PatternView) => this.patternService.getPatternsByUrl(patternViewResponse._links.patterns.href)),
            tap(patterns => {
                this.patterns = patterns;
            }));
    }

    private getData(): Observable<any> {
        const $getPatternLanguages = this.getPatternLanguages();
        const $getCurrentPatternView = this.getCurrentPatternViewAndPatterns();
        return forkJoin([$getPatternLanguages, $getCurrentPatternView]);
    }


    private mapDialogResultToPatterns(res: LoazyLoadedFlatNode[]): Pattern[] {
        if (!res) {
            return [];
        }
        const patternsToAdd = res.map((patternNode) => <Pattern>{
            content: null,
            id: patternNode.item.id,
            name: patternNode.item.name,
            _links: null
        });
        const patternIdsOfView = this.patterns.map(it => it.id);
        // only add patterns that are not already in the view:
        return patternsToAdd.filter(pattern => !patternIdsOfView.includes(pattern.id));
    }


    addLinks(pattern: Pattern) {
        const dialogRef = this.matDialog.open(AddToViewComponent,
            {data: {links: this.mapPatternLinksToTreeNode(pattern), title: 'Add linked Patterns', patternId: pattern.id}});
        this.subscribeToLinkDialogResult(dialogRef);
    }


    private subscribeToLinkDialogResult(dialogRef: MatDialogRef<AddToViewComponent, any>) {
        let nodesToAdd;
        dialogRef.afterClosed().pipe(
            tap(res => {
                nodesToAdd = res;
                console.log(res);
            }),
            switchMap((res) =>
                this.patternViewService.addPatterns(this.patternViewResponse._links.patterns.href, this.mapDialogResultToPatterns(res))),
            switchMap(() =>
                this.patternViewService.addLinks(this.patternViewResponse._links.directedEdges.href, this.patternViewResponse._links.undirectedEdges.href,
                    nodesToAdd.map(it => it.item.edge))),
            switchMap(result => result ? this.getCurrentPatternViewAndPatterns() : EMPTY)
        ).subscribe((res) => {
            if (res) {
                this.toasterService.pop('success', 'Data added');
                this.cdr.detectChanges();
            }
        });
    }

    createLink() {
        const dialogRef = this.matDialog.open(CreatePatternRelationComponent, {data: {patterns: this.patterns, patternview: this.patternViewResponse}});
        dialogRef.afterClosed().pipe(
            switchMap((dialogResult) => {
                const url = dialogResult instanceof DirectedEdgeModel ? this.patternViewResponse._links.directedEdges.href :
                    this.patternViewResponse._links.undirectedEdges.href;
                return dialogResult ? this.patternViewService.createLink(url, dialogResult) : EMPTY;
            }),
            switchMap((edge) => edge ? this.getCurrentPatternViewAndPatterns() : EMPTY)).subscribe((res) => {
            if (res) {
                this.toasterService.pop('success', 'Relation added');
                this.cdr.detectChanges();
            }
        });
    }

    detectChanges() {
        this.cdr.detectChanges();
        console.log('detected');
    }

    private mapPatternLinksToTreeNode(pattern: Pattern): LinksToOtherPattern[] {
        const types: LinksToOtherPattern[] = [];
        const possibleEdgeTypes = [
            {link: pattern._links.ingoingDirectedEdgesFromPatternLanguage, displayName: 'Ingoing directed edges'},
            {link: pattern._links.outgoingDirectedEdgesFromPatternLanguage, displayName: 'Outgoing directed edges'},
            {link: pattern._links.undirectedEdgesFromPatternLanguage, displayName: 'Undirected edges'}
        ];
        possibleEdgeTypes.forEach((type: { link: HalLink | HalLink[], displayName: string }, index) => {
            if (type.link) {
                types.push({name: type.displayName, links: Array.isArray(type.link) ? type.link : [type.link], id: index.toString()});
            }
        });
        return types;
    }

    getLinkCount(directedEdges: HalLink[] | HalLink) {
        if (!directedEdges) {
            return 0;
        }
        return Array.isArray(directedEdges) ? directedEdges.length : 1;
    }


}
