// import { useEffect, useState } from "react";
// import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
// import Dashboard from "components/layouts";
// import Login from "components/Auth/SignInForm";
// import ForgotPasswordForm from "components/Auth/ForgotPasswordForm";
// import VerifyEmail from "components/Auth/VerifyEmail";
// import ResetPassword from "components/Auth/ResetPassword";
// import SignUpForm from "components/Auth/SignUpForm";
import AsyncStorage from '@react-native-async-storage/async-storage';

import {BACKEND_URL} from '../utils/env';
import routeSchema from './backendRoutes.json';

const server = BACKEND_URL;

// interface RouteObject {
//   name: string;
//   path: string;
//   element: React.ReactElement;
//   isProtected: boolean;
// }

// const routes: RouteObject[] = [{
//   name: "Dashboard",
//   path: "/",
//   element: <Dashboard />,
//   isProtected: true
// },
// {
//   name: "Login",
//   path: "/login",
//   element: <Login />,
//   isProtected: false
// }, {
//   name: "Forgot Password",
//   path: "/forgot-password",
//   element: <ForgotPasswordForm />,
//   isProtected: false
// },
// {
//   name: "SignUp Form",
//   path: "/SignUp",
//   element: <SignUpForm />,
//   isProtected: false
// },
// {
//   name: "resetPassword",
//   path: "/auth/reset-password",
//   element: <ResetPassword />,
//   isProtected: false,
// },
// {
//   name: "Verify Email",
//   path: "/verify-email",
//   element: <VerifyEmail />,
//   isProtected: false
// }]

// const Router = () => {
//   const [isLoggedIn, setisLoggedIn] = useState<any>(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const checkUserLoginStatus = async () => {
//     try {
//       const response: any = await appRequest('user', 'isLoggedIn')
//       if (response === true) {
//         setisLoggedIn(true);
//       } else {
//         setisLoggedIn(false);
//       }
//     } catch (err) {
//       setisLoggedIn(false);
//       setIsLoading(false);
//     }
//   };
//   useEffect(() => {
//     checkUserLoginStatus();
//   }, []);

//   // Fetch the token from local storage and send a loggedIn request to the backend to check if the token is valid
//   return (
//     <BrowserRouter>
//       <Routes>
//         {routes.map((route) => {
//           const { path, element, isProtected } = route;
//           const isAuthorized = !isProtected || isLoggedIn;
//           return (
//             <Route
//               key={path}
//               path={path}
//               element={isAuthorized ? (isLoggedIn && path === '/login' ? <Navigate to="/" /> : element) : <Navigate to="/login" />}
//             />
//           );
//         })}
//       </Routes>
//     </BrowserRouter>
//   );
// };

interface RouteSchema {
  [key: string]: {
    [key: string]: {
      url: string;
      method: string;
      body?: any;
      headers?: any;
      query?: object;
    };
  };
}

const typedRouteSchema: RouteSchema = routeSchema;

export async function appRequest(
  type: string,
  requestType: string,
  inputs?: any,
) {
  return new Promise(async (resolve, reject) => {
    try {
      let request = typedRouteSchema[type][requestType];
      let {url, method, headers, body, query} = request;

      if (headers) {
         let token = await AsyncStorage.getItem('auth-token');
                  headers['Authorization'] = 'Bearer ' + token;
        }

      let id;
      let response;
      switch (method) {
        case 'GET':
          let queries = '';
          if (query) {
            if (inputs) {
              queries = '';
              Object.entries(inputs).forEach(([key, value]) => {
                queries += `${key}=${value}&`;
              });
            } else {
              reject('No inputs provided');
            }
          }
          response = await getRequest(url, headers, queries);
          break;
        case 'POST':
          if (!body) {
            body = {};
          } else if (inputs) {
            body = inputs;
          } else {
            reject('No inputs provided');
          }
          response = await postRequest(url, headers, body);
          break;
        case 'PUT':
          if (!body) {
            body = {};
          } else if (inputs && inputs.id) {
            id = inputs.id;
            delete inputs.id;
            body = inputs;
          } else {
            reject('No inputs or id provided');
          }
          response = await putRequest(url, headers, id, body);
          break;
        case 'DELETE':
          if (inputs && inputs.id) {
            id = inputs.id;
          } else {
            reject('No id provided');
          }
          response = await deleteRequest(url, headers, id);
          break;
        default:
          reject('Invalid request method');
      }
      resolve(response);
    } catch (err) {
      reject(err);
    }
  });
}

export function postRequest(url: string, headers: any, body: any) {
  return new Promise(async (resolve, reject) => {
    const objectToFormData = (
      obj: any,
      formData: FormData,
      parentKey?: string,
    ) => {
      if (typeof obj !== 'object' || obj === null) {
        formData.append(parentKey || '', obj);
      } else {
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const nestedKey = parentKey ? `${parentKey}.${key}` : key;
          objectToFormData(value, formData, nestedKey);
        });
      }
    };

    const formData = new FormData();
    objectToFormData(body, formData);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    };
    try {
      const response = await fetch(`${server}/${url}`, requestOptions);
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });
}

export function getRequest(url: string, headers: any, query: string) {
  return new Promise(async (resolve, reject) => {
    const requestOptions = {
      method: 'GET',
      headers: headers,
    };
    try {
      if (query) query = '?' + query || '';
      const response = await fetch(`${server}/${url}${query}`, requestOptions);
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });
}


export function putRequest(url: string, headers: any, id: string, data: any) {
  return new Promise(async (resolve, reject) => {
    const requestOptions = {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
    };
    try {
      const response = await fetch(`${server}/${url}/${id}`, requestOptions);
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });
}

export function deleteRequest(url: string, headers: any, id: string) {
  return new Promise(async (resolve, reject) => {
    const requestOptions = {
      method: 'DELETE',
      headers: headers,
    };
    try {
      const response = await fetch(`${server}/${url}/${id}`, requestOptions);
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });
}

// export default Router;
