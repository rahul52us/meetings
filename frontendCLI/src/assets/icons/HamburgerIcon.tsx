import React from 'react';
import Svg, { Rect } from 'react-native-svg';

type HamburgerIconProps = {
    size?: number;
    color?: string;
};

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ size = 24, color = 'black' }) => {
    const barHeight = size ? size * 0.1 : 2;

    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="0.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Top bar */}
            <Rect x="3" y="5" width="18" height={barHeight} rx="1" fill={color} />
            {/* Middle bar */}
            <Rect x="3" y="11" width="18" height={barHeight} rx="1" fill={color} />
            {/* Bottom bar */}
            <Rect x="3" y="17" width="18" height={barHeight} rx="1" fill={color} />
        </Svg>
    );
};

export default HamburgerIcon;
