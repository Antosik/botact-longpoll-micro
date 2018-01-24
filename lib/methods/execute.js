module.exports = function (method, settings, callback = () => {}) {
  const code = `API.${method}(${JSON.stringify(settings)})`;

  this.methods.push({ code, callback });

  return this;
};
