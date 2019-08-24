import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EnterpriseIntegrationPatternsLinkInfoLoaderService } from '../../loader/enterprise-integration-patterns-link-info-loader.service';
import { IriConverter } from 'src/app/core/util/iri-converter';
import LinkInfo from '../../model/link-info';

@Component({
  selector: 'pp-link-infobox',
  templateUrl: './link-infobox.component.html',
  styleUrls: ['./link-infobox.component.scss']
})
export class LinkInfoboxComponent implements OnInit {

  // the id of the link
  @Input() linkId: string;
  // the id of the currently inspected pattern. Can be null
  @Input() currentPatternId?: string;

  linkInfo: LinkInfo;

  // gets called if a pattern within the infobox has been clicked, parameter is the corresponding id of the pattern
  @Output() onPatternClicked = new EventEmitter<string>();

  constructor(private loader: EnterpriseIntegrationPatternsLinkInfoLoaderService) { }

  ngOnInit() {
    this.loadContent();
  }

  // loads the link informations from the triplestore with the id
  loadContent() {
    const uri = IriConverter.convertIdToIri(this.linkId);
    this.loader.loadContentFromStore(uri)
      .then(linkMap => {
        const data = linkMap.get(uri);

        if (this.currentPatternId) {
          if (data.sourcePattern.id === this.currentPatternId) {
            this.linkInfo = {
              currPattern: {
                id: data.sourcePattern.id,
                name: data.sourcePattern.name
              },
              linkedPattern: {
                id: data.targetPattern.id,
                name: data.targetPattern.name
              },
              descriptions: data.descriptions,
              direction: 'outgoing'
            };
          } else if (data.targetPattern.id === this.currentPatternId) {
            this.linkInfo = {
              currPattern: {
                id: data.targetPattern.id,
                name: data.targetPattern.name
              },
              linkedPattern: {
                id: data.sourcePattern.id,
                name: data.sourcePattern.name
              },
              descriptions: data.descriptions,
              direction: 'incoming'
            };
          }
        } else {
          // default case is, source pattern is the current pattern
          this.linkInfo = {
            currPattern: {
              id: data.sourcePattern.id,
              name: data.sourcePattern.name
            },
            linkedPattern: {
              id: data.targetPattern.id,
              name: data.targetPattern.name
            },
            descriptions: data.descriptions,
            direction: 'outgoing'
          };
        }
      });
  }

  onClick(event: any, id: string) {
    event.stopPropagation();

    this.onPatternClicked.emit(id);
  }

}
