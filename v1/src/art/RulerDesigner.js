import React from 'react';
import LinearDrawingModel from '../model/LinearDrawingModel';

const MAX_MAJOR_TICKS = 15;
const MINOR_TICKS = 5;
const MAJOR_TICK_HEIGHT = 10; // Minor tick height is half this
const COLOR = '#bbb';

/**
 * Designs a ruler that displays feature coordinates.  Note that feature coordinates are not necessarily genomic
 * coordinates.
 * 
 * @author Silas Hsu
 */
export class RulerDesigner {
    /**
     * Configures a new instance.  What components the design() method returns depends on the passed
     * RulerComponentFactory.  There is a default RulerComponentFactory implementation; see those docs to find out what
     * it returns.
     * 
     * @param {DisplayedRegionModel} viewRegion - region to visualize
     * @param {number} width - width of the ruler
     * @param {RulerComponentFactory} [rulerComponentFactory] - component generator
     */
    constructor(viewRegion, width, rulerComponentFactory=new RulerComponentFactory()) {
        this._viewRegion = viewRegion;
        this._drawModel = new LinearDrawingModel(viewRegion, width);
        this._componentFactory = rulerComponentFactory;
    }

    /**
     * @typedef {Object} Ruler~Unit
     * @property {number} size - the number of base pairs in this unit
     * @property {string} name - a string that represents this unit
     */

    /**
     * Gets the unit for the major tick labels, depending on the number of bases between ticks.  Chooses between unit
     * base, kilobase, and megabase.
     * 
     * @param {number} log10BasesPerTick - log10() of the number of bases between ticks
     * @return {Ruler~Unit} the unit for tick labels
     */
    _getMajorUnit(log10BasesPerTick) {
        if (log10BasesPerTick >= 5) { // 10K
            return {
                size: 1000000,
                name: "M",
            };
        } else if (log10BasesPerTick > 2) { // 100
            return {
                size: 1000,
                name: "K",
            };
        }

        return {
            size: 1,
            name: "",
        };
    }

    /**
     * Designs the ruler.  Returns an array of anything, depending on the RulerComponentFactory configured when this
     * object was created.
     * 
     * @return {any[]} - ruler design
     */
    design() {
        // If one wanted MAX_MAJOR_TICKS to represent the min number of ticks, use Math.floor() instead.
        const log10BasesPerMajorTick = Math.ceil(Math.log10(this._viewRegion.getWidth() / MAX_MAJOR_TICKS));
        const basesPerMajorTick = Math.pow(10, log10BasesPerMajorTick); // Ensures each major tick is a power of 10.
        const basesPerMinorTick = basesPerMajorTick / MINOR_TICKS;
        const pixelsPerMajorTick = this._drawModel.basesToXWidth(basesPerMajorTick);
        const pixelsPerMinorTick = pixelsPerMajorTick / MINOR_TICKS;
        const unit = this._getMajorUnit(log10BasesPerMajorTick);

        let children = [];
        // The horizontal line spanning the width of the ruler
        children.push(this._componentFactory.mainLine(this._drawModel.getDrawWidth()));

        const intervals = this._viewRegion.getFeatureIntervals();
        for (let interval of intervals) {
            const featureAbsStart = this._viewRegion.getNavigationContext().getFeatureStart(interval.getName());
            const majorTickEndX = this._drawModel.baseToX(featureAbsStart + interval.relativeEnd);
            // relativeBase = round down to the nearest major tick base for this region, to find where to start drawing
            let relativeBase = Math.floor(interval.relativeStart / basesPerMajorTick) * basesPerMajorTick;
            let majorX = this._drawModel.baseToX(featureAbsStart + relativeBase);

            // This loop updates relativeBase and majorX every iteration
            // Draw major and minor ticks for this region (chromosome)
            while (majorX < majorTickEndX) {
                // Major ticks
                children.push(this._componentFactory.majorTick(majorX));
                if (relativeBase > 0) {
                    children.push(this._componentFactory.majorTickText(majorX, relativeBase / unit.size + unit.name));
                }

                // Minor ticks
                let minorX = majorX + pixelsPerMinorTick;
                let minorTickEndX = Math.min(majorX + pixelsPerMajorTick, majorTickEndX);
                let minorBase = relativeBase + basesPerMinorTick;
                while (minorX < minorTickEndX) {
                    children.push(this._componentFactory.minorTick(minorX));
                    children.push(this._componentFactory.minorTickText(minorX, minorBase / unit.size));
                    minorBase += basesPerMinorTick;
                    minorX += pixelsPerMinorTick;
                }

                // Update major tick loop vars
                relativeBase += basesPerMajorTick;
                majorX += pixelsPerMajorTick;
            } // End while (majorX < majorTickEndX) { ... }
        } // End for (let region of regionList) { ... }

        return children;
    }
}

/**
 * A generator of components for a Ruler design.  Allows customization of RulerDesigners.  The default implementation
 * returns React components that are valid <svg> elements.
 * 
 * @author Silas Hsu
 */
export class RulerComponentFactory {
    /**
     * Configures a new instance that returns React components that are valid <svg> elements.
     * 
     * @param {string} color - color of the elements
     * @param {number} majorTickHeight - height of major ticks.  Minor ticks will be half this height.
     */
    constructor(color=COLOR, majorTickHeight=MAJOR_TICK_HEIGHT) {
        this.color = color;
        this.majorTickHeight = majorTickHeight;
    }

    /**
     * Creates a component that represents a line that spans the entire width of the ruler.
     * 
     * @param {number} width - width of the ruler
     */
    mainLine(width) {
        return <line key="mainLine" x1={0} y1={0} x2={width} y2={0} stroke={this.color} strokeWidth={1} />;
    }

    /**
     * Creates a component that represents a major tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     */
    majorTick(x) {
        return <line key={x} x1={x} y1={-this.majorTickHeight} x2={x} y2={0} stroke={this.color} strokeWidth={2} />;
    }

    /**
     * Creates a component that labels a major tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     * @param {string} text - label for the tick
     */
    majorTickText(x, text) {
        return <text key={"text" + x}  x={x} y={20} style={{textAnchor: "middle"}} >{text}</text>;
    }

    /**
     * Creates a component that represents minor tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     */
    minorTick(x) {
        return <line key={x} x1={x} y1={-this.majorTickHeight / 2} x2={x} y2={0} stroke={this.color} strokeWidth={1} />;
    }

    /**
     * Creates a component that labels a minor tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     * @param {string} text - label for the tick
     */
    minorTickText(x, text) {
        return null;
    }
}

export default RulerDesigner;