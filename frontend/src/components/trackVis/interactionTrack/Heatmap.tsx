import React from 'react';
import { ScaleLinear } from 'd3-scale';

import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { PlacedInteraction } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';

interface HeatmapProps {
    placedInteractions: PlacedInteraction[];
    viewWindow: OpenInterval;
    width: number;
    opacityScale: ScaleLinear<number, number>;
    color: string;
    onInteractionHovered(event: React.MouseEvent, interaction: GenomeInteraction): void;
    onMouseOut(event: React.MouseEvent): void;
}

export class Heatmap extends React.PureComponent<HeatmapProps, {}> {
    static getHeight(props: HeatmapProps) {
        return 0.5 * props.viewWindow.getLength();
    }

    render() {
        const {placedInteractions, width, opacityScale, color, onInteractionHovered,
            onMouseOut} = this.props;
        const diamonds = [];
        for (const [index, placedInteraction] of placedInteractions.entries()) {
            const score = placedInteraction.interaction.score;
            if (!score) {
                continue;
            }

            const {xSpan1, xSpan2} = placedInteraction;
            const gapCenter = (xSpan1.end + xSpan2.start) / 2;
            const gapLength = xSpan2.start - xSpan1.end;
            const topX = gapCenter;
            const topY = 0.5 * gapLength;
            const halfSpan1 = Math.max(0.5 * xSpan1.getLength(), 4);
            const halfSpan2 = Math.max(0.5 * xSpan2.getLength(), 4);
            const points = [ // Going counterclockwise
                [topX, topY], // Top
                [topX - halfSpan1, topY + halfSpan1], // Left
                [topX - halfSpan1 + halfSpan2, topY + halfSpan1 + halfSpan2], // Bottom = left + halfSpan2
                [topX + halfSpan2, topY + halfSpan2] // Right
            ];
            diamonds.push(<polygon
                key={placedInteraction.generateKey()+index}
                points={points as any} // React can convert the array to a string
                fill={color}
                opacity={opacityScale(score)}
                onMouseMove={event => onInteractionHovered(event, placedInteraction.interaction)} // tslint:disable-line
            />);
        }
        return <svg width={width} height={Heatmap.getHeight(this.props)} onMouseOut={onMouseOut} >{diamonds}</svg>;
    }
}
