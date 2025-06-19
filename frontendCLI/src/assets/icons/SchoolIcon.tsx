// assets/icons/SchoolIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const SchoolIcon = ({ size = 20, color = '#134e4a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 13.18v2.54c0 1.53 3.33 2.78 7.5 2.78s7.5-1.25 7.5-2.78v-2.54l-7.5 3.33-7.5-3.33zM12.5 3L3 7.5l9.5 4.5 9.5-4.5L12.5 3z"
      fill={color}
    />
  </Svg>
);

export default SchoolIcon;
