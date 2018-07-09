import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../../model/TrackModel';
import cytobands from './cytoband.json';
import annotationTracks from './annotationTracks.json';

const genome = new Genome('hg19', [
    new Chromosome('chr1', 249250621),
    new Chromosome('chr2', 243199373),
    new Chromosome('chr3', 198022430),
    new Chromosome('chr4', 191154276),
    new Chromosome('chr5', 180915260),
    new Chromosome('chr6', 171115067),
    new Chromosome('chr7', 159138663),
    new Chromosome('chr8', 146364022),
    new Chromosome('chr9', 141213431),
    new Chromosome('chr10', 135534747),
    new Chromosome('chr11', 135006516),
    new Chromosome('chr12', 133851895),
    new Chromosome('chr13', 115169878),
    new Chromosome('chr14', 107349540),
    new Chromosome('chr15', 102531392),
    new Chromosome('chr16', 90354753),
    new Chromosome('chr17', 81195210),
    new Chromosome('chr18', 78077248),
    new Chromosome('chr19', 59128983),
    new Chromosome('chr20', 63025520),
    new Chromosome('chr21', 48129895),
    new Chromosome('chr22', 51304566),
    new Chromosome('chrX', 155270560),
    new Chromosome('chrY', 59373566),
    new Chromosome('chrM', 16571)
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse('chr7:27053397-27373765');
const defaultTracks = [
    new TrackModel({
        type: 'geneAnnotation',
        name: 'refGene',
        genome: 'hg19'
    }),
    new TrackModel({
        type: 'geneAnnotation',
        name: 'gencodeV28',
        genome: 'hg19'
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "bigwig",
        url: "https://epgg-test.wustl.edu/d/mm10/ENCFF577HVF.bigWig",
        metadata: {
            genome: 'mm10'
        }
    })
];

const HG19 = {
    genome,
    navContext,
    cytobands,
    defaultRegion,
    defaultTracks,
    annotationTracks,
    twoBitURL: 'https://vizhub.wustl.edu/public/hg19/hg19.2bit'
};

export default HG19;
