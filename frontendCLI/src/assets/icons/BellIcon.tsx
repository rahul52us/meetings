import React from 'react';
import Svg, { Path } from 'react-native-svg';

type BellIconProps = {
    size?: number;
    color?: string;
};

const BellIcon: React.FC<BellIconProps> = ({ size = 24, color = 'black' }) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Bell shape */}
            <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            {/* Bell's ringer */}
            <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
    );
};

export default BellIcon;
