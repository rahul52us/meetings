import { SvgXml } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

const EditSVG = ({ width, height, color }: Props) => {
  return (
    <SvgXml
      xml={`
<svg fill="#000000" width=${width || '20'} height=${height || '20'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.6,3.4c-1.2-1.2-3.2-1.2-4.4,0l-9.6,9.6c-0.4,0.4-0.6,0.8-0.6,1.2v4.8c0,1,0.8,1.8,1.8,1.8h4.8c0.4,0,0.8-0.2,1.2-0.6l9.6-9.6c1.2-1.2,1.2-3.2,0-4.4l-3.6-3.6c-1.2-1.2-3.2-1.2-4.4,0l-1.6,1.6L14.6,8.2l3.2-3.2c0.4-0.4,1-0.4,1.4,0l1.2,1.2c0.4,0.4,0.4,1,0,1.4L14.6,12.2l-1.8-1.8L14.6,7.2l-1.4-1.4L8.6,6.6,12.2,10.2l-1.8,1.8l-1.8-1.8l5.2-5.2l1.2-1.2c1.2-1.2,1.2-3.2,0-4.4Z" fill=${color || 'black'} /></svg>`}
    />
  );
};

export default EditSVG;
