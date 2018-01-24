const api = require('../api');
const callbackHandler = require('./callbackHandler');

module.exports = (methods, access_token) => {
  const codes = methods.map(({code}) => code);
  const callbacks = methods.map(({callback}) => callback);

  for (let i = 0, j = Math.ceil(codes.length / 25); i < j; i++) {
    api('execute', {
      code: `return [ ${codes.slice(i * 25, i * 25 + 25)} ];`,
      access_token
    })
      .then(data => callbackHandler(data, callbacks))
      .catch(err => callbackHandler(err, callbacks));
  }

  return this;
};
