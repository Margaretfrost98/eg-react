import React from 'react';
import PropTypes from 'prop-types';
import Track from '../commonComponents/Track';
import TrackLegend from '../commonComponents/TrackLegend';
import { ThreeScene } from './ThreeScene';

export const DEFAULT_OPTIONS = {
    height: 500,
    backgroundColor: 'black',
    region: 'region',
    resolution: 200000,
    showChromLabels: true
};

/**
 * Track displaying 3d structure.
 *
 * @author Daofeng Li
 */
class G3dTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(QBed)
        options: PropTypes.shape({
            height: PropTypes.number.isRequired // Height of the track
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any // If present, applies error styling
    });

    render() {
        const { data, trackModel, width, options } = this.props;
        // const newProps = {
        //         ...this.props,
        //         onContextMenu: () => null,
        //         onClick: () => null,
        //     };
        return (
            <Track
                {...this.props}
                legend={<TrackLegend trackModel={trackModel} height={options.height} />}
                // legend={<TrackLegend trackModel={trackModel} height={50} />}
                visualizer={<ThreeScene data={data} width={width} height={options.height} options={options} />}
            />
        );
    }
}

export default G3dTrack;
