import React from 'react';
import Svg, { Path } from 'react-native-svg';

type BackIconProps = {
    size?: number;
    color?: string;
};

const BackIcon: React.FC<BackIconProps> = ({ size = 24, color = 'black' }) => {
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
            <Path d="M19 12H5" />
            <Path d="M12 19l-7-7 7-7" />
        </Svg>
    );
};

export default BackIcon;