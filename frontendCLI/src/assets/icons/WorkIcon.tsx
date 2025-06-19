// assets/icons/WorkIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const WorkIcon = ({ size = 20, color = '#134e4a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 6V4h-4v2H3v14h18V6h-7zm-4-2h4v2h-4V4zm10 16H4V8h16v12z"
      fill={color}
    />
  </Svg>
);

export default WorkIcon;
