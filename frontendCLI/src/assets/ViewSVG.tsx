import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ViewSVG = ({ color = "#007AFF", width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6Zm0-10a4 4 0 0 0-4 4 4 4 0 1 0 4-4Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
        fill={color}
      />
    </Svg>
  );
};

export default ViewSVG;
