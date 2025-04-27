import React from 'react';
import Svg, { Path } from 'react-native-svg';

const UserSVG = ({ width = 40, height = 40, color = '#007AFF' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 14c-4.418 0-8 2.686-8 6 0 .553.448 1 1 1h14c.552 0 1-.447 1-1 0-3.314-3.582-6-8-6z"
        fill={color}
      />
    </Svg>
  );
};

export default UserSVG;
