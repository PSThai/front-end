const { override, useBabelRc } = require('customize-cra');

// Export Override
module.exports = override(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useBabelRc(),
);
