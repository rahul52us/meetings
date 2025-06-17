import Config from 'react-native-config';
// export const BACKEND_URL = "https://7b7e-2402-8100-26e8-cc94-485c-1228-422c-7846.ngrok-free.app"
export const BACKEND_URL = "https://6fd8-2402-8100-26f1-584f-9d8a-cdf2-fdb4-7ac.ngrok-free.app"


console.log("backend urls", BACKEND_URL)
if (!BACKEND_URL) {
  console.log(
    'No backend url string. Set REACT_APP_BACKEND_URL environment variable.',
  );
  process.exit(1);
}