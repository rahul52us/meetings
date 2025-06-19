// assets/icons/AgentIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const AgentIcon = ({ size = 20, color = '#134e4a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05.84.6 1.47 1.39 1.72 2.45L17 19h5v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill={color}
    />
  </Svg>
);

export default AgentIcon;
