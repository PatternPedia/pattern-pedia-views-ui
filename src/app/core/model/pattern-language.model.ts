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

import { IriConverter } from '../util/iri-converter';

class PatternLanguage {
    private _id: string;
    name: string;
    logos: Array<string>;
    iri: string;
    patternIRIs: Array<string>;

    set id(iri: string) {
        this._id = IriConverter.convertIriToId(iri);
    }

    get id(): string {
        return this._id;
    }

    public constructor(iri: string = null, name: string = null, logos: Array<string> = null, patternIRIs: Array<string> = null) {
        this.name = name;
        this.logos = logos || [];
        this.patternIRIs = patternIRIs || [];
        this.iri = iri;
        this.id = iri;
    }
}

export default PatternLanguage;