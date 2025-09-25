import { LinkingOptions } from '@react-navigation/native';

const linking: LinkingOptions<any> = {
  prefixes: ['amdday01://', 'https://daily-spend.firebaseapp.com'], // update if your Firebase domain is different
  config: {
    screens: {
      '(auth)': {
        screens: {
          EmailCodeVerificationScreen: 'verify',
          login: 'login',
          register: 'register',
        },
      },
      '(dashboard)': {
        screens: {
          dashboard: 'dashboard',
        },
      },
    },
  },
};

export default linking;
