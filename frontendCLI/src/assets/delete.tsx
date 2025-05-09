import {SvgXml} from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

const DeleteSVG = ({width, height, color}: Props) => {
  return (
    <SvgXml
      xml={`
<svg fill="#000000" width=${width || '20'} height=${
        height || '20'
      } viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,5H17V2a1,1,0,0,0-1-1H8A1,1,0,0,0,7,2V5H2A1,1,0,0,0,2,7H3.117L5.008,22.124A1,1,0,0,0,6,23H18a1,1,0,0,0,.992-.876L20.883,7H22a1,1,0,0,0,0-2ZM9,3h6V5H9Zm8.117,18H6.883L5.133,7H18.867Z" fill=${
        color || 'black'
      }/></svg>`}
    />
  );
};

export default DeleteSVG;
