import React from 'react';
import Svg, { Path } from 'react-native-svg';

type HomeIconProps = {
    size?: number;
    color?: string;
    strokeWidth?: any;
};

const Home: React.FC<HomeIconProps> = ({ size = 24, color = 'black', strokeWidth = '1.5' }) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Home shape */}
            <Path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
            {/* Home's door */}
            <Path d="M9 20V12h6V20" />
        </Svg>
    );
};

export default Home;