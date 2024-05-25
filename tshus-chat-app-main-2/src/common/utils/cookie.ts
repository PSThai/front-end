import Cookies from 'js-cookie';

// Set Cookie with expired time
export const setCookie = async (key: string, data: any, expires: string) => {
  // Expires Date
  const expr = new Date(expires);

  // Data to string
  const strData = JSON.stringify(data);

  // Set Token and save to Cookie
  Cookies.set(key, strData, { expires: expr });
};

// Set Cookie with expired time
export const setCookieNoExp = async (key: string, data: any) => {
  // Data to string
  const strData = JSON.stringify(data);

  // Set Token and save to Cookie
  Cookies.set(key, strData);
};

// Get Cookie Data
export const getCookie = (key: string): any | null => {
  // Get Cookie
  const result: string | undefined = Cookies.get(key);

  // Check result
  if (result && result !== 'undefined') {
    // Parse
    const parseResult = JSON.parse(result);

    // Return
    return parseResult;
  } else {
    return null;
  }
};

// Get Cookie Data
export const deleteCookie = (key: string): void => Cookies.remove(key);
