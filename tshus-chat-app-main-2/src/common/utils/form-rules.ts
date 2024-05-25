// Verify Phone rules
export const verifyPhone = (_: any, value: any) => {
  // Check empty value
  if (!value) {
    // Return reject
    return Promise.reject('Trường này không được để trống');
  }
  // Regex phone number
  const phoneRegex = /^[0-9]{10}$/;

  // Check phone number
  if (!phoneRegex.test(value)) {
    // Return reject
    return Promise.reject('Vui lòng nhập số điện thoại cần tìm');
  }
  // Return resolve
  return Promise.resolve();
};

// Verify Phone rules
export const verifyEmail = (_: any, value: any) => {
  // Check empty value
  if (!value) {
    // Return reject
    return Promise.reject('Trường này không được để trống!');
  }
  // Regex email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check email
  if (!emailRegex.test(value)) {
    // Return reject
    return Promise.reject('Vui lòng nhập email người dùng cần tìm!');
  }
  // Return resolve
  return Promise.resolve();
};
