import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import SingleInputConfig from './SingleInputConfig';
import { getSubtypeConfig } from '../subtypeConfig';
import TrackModel from '../../../model/TrackModel';

import './TrackContextMenu.css';

/**
 * Props that menu items will recieve.
 */
export const ITEM_PROP_TYPES = {
    /**
     * Tracks to consider when rendering info that the menu item displays
     */
    tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),

    /**
     * Callback for when the item requests a change.  Signature: (replaceTrack: TrackReplacer): void
     *     TrackReplacer is defined at the bottom of this file.
     */
    onChange: PropTypes.func
};

export const ITEM_DEFAULT_PROPS = {
    tracks: [],
    onChange: (replaceTrack) => undefined
};

/**
 * Context menu specialized for managing track options and metadata.
 * 
 * @author Silas Hsu
 */
class TrackContextMenu extends React.PureComponent {
    static propTypes = {
        /**
         * List of tracks to manage.  Only changes selected tracks, but it accepts unselected ones as to preserve track
         * positions in the onTracksChanged callback.
         */
        allTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),

        /**
         * Called when the menu has configured one or more tracks of allTracks.
         *     Signature: (nextTracks: TrackModel[]): void
         *         `nextTracks` - array of TrackModel derived from the `allTracks` prop
         */
        onTracksChanged: PropTypes.func,
    };

    static defaultProps = {
        allTracks: [],
        onTracksChanged: () => undefined,
    };

    constructor(props) {
        super(props);
        this.changeSelectedTracks = this.changeSelectedTracks.bind(this);
        this.removeSelectedTracks = this.removeSelectedTracks.bind(this);
    }

    /**
     * Renders menu items that are specific to the types of the currently selected tracks.  Does an intersection so only
     * items that all of the selected tracks share get rendered.
     * 
     * @param {Track[]} selectedTracks - selected tracks; tracks that menu items should consider
     */
    renderTrackSpecificItems(selectedTracks) {
        let menuComponents = []; // Array of arrays, one for each track
        for (let trackModel of selectedTracks) {
            const menuItems = getSubtypeConfig(trackModel).menuItems;
            if (!menuItems) { // Intersecting anything with the empty set is the empty set, so we can stop right here.
                menuComponents = [];
                break;
            }
            menuComponents.push(menuItems);
        }

        const commonMenuComponents = _.intersection(...menuComponents);
        return commonMenuComponents.map((MenuComponent, index) =>
            <MenuComponent key={index} tracks={selectedTracks} onOptionSet={this.changeSelectedTracks} />
        );
    }

    /**
     * A callback for when menu items are changed.  Menu items should pass an option prop name and the new value for
     * that prop.  This function makes new tracks with the new option value, and passes them to the parent element.
     * 
     */
    changeSelectedTracks(optionName, value) {
        const nextTracks = this.props.allTracks.map(track => {
            if (track.isSelected) {
                return track.cloneAndSetOption(optionName, value);
            } else {
                return track;
            }
        });
        this.props.onTracksChanged(nextTracks);
    }

    /**
     * Requests a removal of all selected tracks.
     */
    removeSelectedTracks() {
        const unselectedTracks = this.props.allTracks.filter(track => !track.isSelected);
        this.props.onTracksChanged(unselectedTracks);
    }

    /** 
     * @inheritdoc
     */
    render() {
        const selectedTracks = this.props.allTracks.filter(track => track.isSelected);
        if (selectedTracks.length === 0) {
            return null;
        }

        return (
        <div className="TrackContextMenu-body">
            <MenuTitle tracks={selectedTracks} />
            <LabelConfig tracks={selectedTracks} onOptionSet={this.changeSelectedTracks} />
            {this.renderTrackSpecificItems(selectedTracks)}
            <RemoveOption numTracks={selectedTracks.length} onClick={this.removeSelectedTracks} />
        </div>
        );
    }
}

/**
 * Title for the context menu.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MenuTitle(props) {
    const numTracks = props.tracks.length;
    const text = numTracks === 1 ? props.tracks[0].getDisplayLabel() : `${numTracks} tracks selected`;
    return <div style={{paddingLeft: 5, fontWeight: 'bold'}} >{text}</div>;
}

/**
 * Context menu item for setting track labels.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function LabelConfig(props) {
    return <SingleInputConfig {...props} optionName="label" label="Track label:" hasSetButton={true} />;
}

/**
 * A menu item that displays an option for track removal.  Note that the props for this item do not follow the schema
 * for other menu items.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function RemoveOption(props) {
    return (
    <div onClick={props.onClick} className="TrackContextMenu-item TrackContextMenu-hoverable-item-danger" >
        {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
        ❌ {props.numTracks === 1 ? "Remove" : `Remove ${props.numTracks} tracks`}
    </div>
    );
}

export default TrackContextMenu;
