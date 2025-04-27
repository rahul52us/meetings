import { SvgXml } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

const AddFolderSVG = ({ width, height, color }: Props) => {
  return (
    <SvgXml
      xml={`
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 593.523 593.523"
  width=${width || "20"}
  height=${height || "20"}
>
  <path fill=${color || "black"} d="M584.344,133.083H275.342c-5.07,0-12.182-2.806-15.888-6.267L226.22,95.758c-3.706-3.461-10.817-6.267-15.888-6.267H9.18 c-5.07,0-9.18,4.109-9.18,9.18v396.182c0,5.07,4.109,9.18,9.18,9.18h575.164c5.07,0,9.18-4.109,9.18-9.18V142.264 C593.523,137.193,589.414,133.083,584.344,133.083z M432.932,357.278H331.267v101.664h-69.009V357.278H160.592v-69.01h101.666 V186.603h69.012v101.666h101.662V357.278z"/>
</svg>`}
    />
  );
};

export default AddFolderSVG;
