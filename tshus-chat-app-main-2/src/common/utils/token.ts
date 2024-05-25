import jwt from 'jsonwebtoken';

// Check token expired
export const isTokenExpired = async (token: string) => {
  // Decoded Token
  const decodeToken = jwt.decode(token);

  // Get Current Time
  const currentTime = Date.now() / 1000;

  // Return
  return decodeToken?.exp === undefined ? true : decodeToken?.exp < currentTime;
};
