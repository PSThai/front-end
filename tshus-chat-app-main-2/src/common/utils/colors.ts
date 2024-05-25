import { ThemeEnum } from "@/common/enum/theme.enum";

// Colors
export const colors = (theme: ThemeEnum) => {
     // Check switch case
     switch (theme) {
       case ThemeEnum.DARK:
         return {
           colorTextBase: 'white',
           colorBorder: '#383e44',
           colorBgBase: '#2a2f34',
           colorBgSpotlight: '#999',
           colorPrimaryBg: 'transparent',
           colorPrimary: 'rgb(80 165 241)',
           selectorBg: 'red',
         };
       default:
         return {
           colorTextBase: '#000',
           colorBorder: '#e6ebf5',
           colorBgBase: 'white',
           colorPrimaryBg: 'transparent',
           colorPrimary: 'rgb(80 165 241)',
         };
     }
   };
   
   // Component token
   export const components = (theme: ThemeEnum) => {
     // Check switch case
     switch (theme) {
       case ThemeEnum.DARK:
         return {
           Select: {
             optionSelectedBg: '#111a2c',
           },
         };
       default:
         return {
           Select: {
             optionSelectedBg: '#e6f4ff',
           },
         };
     }
   };