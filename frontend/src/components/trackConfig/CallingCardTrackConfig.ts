import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import { CallingCardTrack } from '../trackVis/CallingCardTrack';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import BedRecord from '../../dataSources/bed/BedRecord';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import LocalBedSource from '../../dataSources/LocalBedSource';

enum BedColumnIndex {
    NAME=3,
    SCORE=4,
    STRAND=5,
};

export class CallingCardTrackConfig extends AnnotationTrackConfig {
    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url);
        }
    }

    /**
     * Converts BedRecords to Features.
     * 
     * @param {BedRecord[]} data - bed records to convert
     * @return {Feature[]} bed records in the form of Feature
     */
    formatData(data: BedRecord[]) {
        console.log(data);
        return data.map(record => new Feature(
            // "." is a placeholder that means "undefined" in the bed file.
            record[BedColumnIndex.NAME] === "." ? "" : record[BedColumnIndex.NAME],
            new ChromosomeInterval(record.chr, record.start, record.end),
            record[BedColumnIndex.STRAND]
        ));
    }

    getComponent() {
        return CallingCardTrack;
    }
}
