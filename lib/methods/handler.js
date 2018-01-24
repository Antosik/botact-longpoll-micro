module.exports = async function (update) {
  const [ type ] = update;

  if (type !== 4) {
    return;
  }

  const [ , message_id, flags, peer_id, date, body, attachments ] = update;

  if ((flags & 2) !== 0) {
    return;
  }

  const ctx = {
    peer_id,
    message_id,
    body,
    attachments,
    date,
  };

  if (attachments.from) {
    ctx.from = +attachments.from;
  }

  const forward = await this.getForward(ctx);

  if (forward) {
    ctx.forward = forward;
    ctx.original = { body: ctx.body };
    ctx.body = forward.body;
  }

  const attachmentsArray = [];

  for (let [key, value] of Object.entries(ctx.attachments)) {
    if (key.search('attach') > -1 && key.search('type') === -1 && key.search('kind')) {
      attachmentsArray.push(ctx.attachments[`${key}_type`] + value);
    }
  }

  ctx.attachments = attachmentsArray;


  ctx.reply = (message, attachment, callback) => this.reply(ctx.peer_id, message, attachment, callback);
  ctx.sendMessage = (userId, message, attachment, callback) => this.reply(userId, message, attachment, callback);

  const { middlewares, on: reserved } = this.actions;

  if (middlewares.length) {
    try {
      await Promise.all(middlewares.map(callback => callback(ctx)));
    } catch (error) {
      console.error(`${new Date()}: Middleware error!`, error);
      process.exit(1);
    }
  }

  if (reserved) {
    reserved(ctx);
  }
};
