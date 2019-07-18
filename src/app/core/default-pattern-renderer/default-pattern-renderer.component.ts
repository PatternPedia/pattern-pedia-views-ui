import { ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { IriConverter } from '../util/iri-converter';
import { ActivatedRoute } from '@angular/router';
import { DefaultPatternLoaderService } from '../service/loader/default-pattern-loader.service';
import { DefaultPlLoaderService } from '../service/loader/default-pl-loader.service';
import { PatternOntologyService } from '../service/pattern-ontology.service';
import { PatternProperty } from '../service/data/PatternProperty.interface';
import { ToasterService } from 'angular2-toaster';
import { SectionResponse } from '../service/data/SectionResponse.interface';
import { PlRestrictionLoaderService } from '../service/loader/pattern-language-loader/pl-restriction-loader.service';
import { IntegerComponent } from '../component/type-templates/xsd/integer/integer.component';
import { PatternpropertyDirective } from '../component/type-templates/patternproperty.directive';
import { PatternLanguageSectionRestriction } from '../model/PatternLanguageSectionRestriction.model';
import { StringComponent } from '../component/type-templates/xsd/string/string.component';
import PatternPedia from '../model/pattern-pedia.model';
import { ImageComponent } from '../component/type-templates/dcmitype/image/image.component';
import { DataRenderingComponent } from '../component/type-templates/interfaces/DataRenderingComponent.interface';
import { DividerComponent } from '../component/type-templates/divider/divider.component';
import { DateComponent } from '../component/type-templates/xsd/date/date.component';

@Component({
  selector: 'pp-default-pattern-renderer',
  templateUrl: './default-pattern-renderer.component.html',
  styleUrls: ['./default-pattern-renderer.component.scss']
})
export class DefaultPatternRendererComponent implements OnInit {
  private sectionRestritions: Map<string, PatternLanguageSectionRestriction[]>;

  constructor(private patternLoaderService: DefaultPatternLoaderService, private sectionLoader: PlRestrictionLoaderService, private plLoader: DefaultPlLoaderService, private activatedRoute: ActivatedRoute,
              private pos: PatternOntologyService, private toasterService: ToasterService, private cdr: ChangeDetectorRef,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  plIri: string;
  patternIri: string;
  patternProperties: PatternProperty[];
  sections: SectionResponse[];
  isLoadingPattern = true;
  isLoadingSection = true;
  @ViewChild(PatternpropertyDirective) ppPatternproperty: PatternpropertyDirective;

  standardPrefixes = new PatternPedia().defaultPrefixes;
  xsdPrefix = this.standardPrefixes.get('xsd').replace('<', '').replace('>', '');
  dcmiPrefix = 'http://purl.org/dc/dcmitype/';

  defaultComponentForType: Map<string, any> = new Map([
    [this.xsdPrefix + 'string', StringComponent],
    [this.xsdPrefix + 'integer', IntegerComponent],
    [this.xsdPrefix + 'positiveInteger', IntegerComponent],
    [this.xsdPrefix + 'nonPositiveInteger', IntegerComponent],
    [this.xsdPrefix + 'nonNegativeInteger', IntegerComponent],
    [this.xsdPrefix + 'negativeInteger', IntegerComponent],
    [this.xsdPrefix + 'date', DateComponent],
    [this.dcmiPrefix + 'Image', ImageComponent],

  ]);


  ngOnInit() {

    this.plIri = IriConverter.convertIdToIri(this.activatedRoute.snapshot.paramMap.get('plid'));
    this.patternIri = IriConverter.convertIdToIri(this.activatedRoute.snapshot.paramMap.get('pid'));

    this.loadInfos().then(() => {
      const viewContainerRef = this.ppPatternproperty.viewContainerRef;
      viewContainerRef.clear();

      const componentDividerFactory = this.componentFactoryResolver.resolveComponentFactory(DividerComponent);
      this.patternProperties.forEach((property: PatternProperty) => {

        const sectionRestrictions = this.sectionRestritions.get(property.property.value);
        const sectionTitle = property.property.value.split('#has')[1].replace(/([A-Z])/g, ' $1').trim();
        console.log(sectionTitle);
        const type = (sectionRestrictions && !!sectionRestrictions[0] && sectionRestrictions[0].type) ? sectionRestrictions[0].type : this.xsdPrefix + 'string';
        console.log(sectionRestrictions);
        console.log(type);
        const component = this.defaultComponentForType.get(type) ? this.defaultComponentForType.get(type) : StringComponent;

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef = viewContainerRef.createComponent(componentFactory);
        (<DataRenderingComponent>componentRef.instance).data = property.predicate.value;
        viewContainerRef.createComponent(componentDividerFactory); // create divider
      });
    });


  }

  getSectionName(iri: string): string {
    return IriConverter.getSectionName(iri);
  }

  getSectionInfo(iri: string): SectionResponse {
    if (!iri || !this.sections) {
      return;
    }
    return this.sections.filter(s => s.section.value === iri)[0];
  }

  private async loadInfos(): Promise<any> {
    this.patternLoaderService.supportedIRI = this.patternIri;
    this.sectionLoader.supportedIRI = this.plIri;

    await this.pos.loadUrisToStore( [{token: this.patternIri, value: IriConverter.getFileName(this.patternIri)}]);


    const loadingResult = await this.patternLoaderService.selectContentFromStore();
    this.patternProperties = Array.from(loadingResult.values());
    this.isLoadingPattern = false;

    // not that we loaded the data for the pattern, load all the data from patternlanguage
    await this.pos.loadUrisToStore( [{token: this.patternIri, value: IriConverter.getFileName(this.plIri)}]);
    this.plLoader.supportedIRI = this.plIri;
    await this.plLoader.loadContentFromStore();

    this.sectionRestritions = await this.sectionLoader.loadContentFromStore();

    this.sections = await this.plLoader.getPLSections(this.plIri);
    this.isLoadingSection = false;

    if (!this.patternProperties) {
      this.toasterService.pop('success', 'Loaded all infos');
      Promise.reject(null);

    } else {
      Promise.resolve(null);
    }
  }
}
