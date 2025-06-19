// assets/icons/BusinessIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BusinessIcon = ({ size = 20, color = '#134e4a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7V3H2v18h20V7h-10zm8 12H4V5h6v4h10v10z"
      fill={color}
    />
  </Svg>
);

export default BusinessIcon;
