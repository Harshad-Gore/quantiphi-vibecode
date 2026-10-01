// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[api-error]', err.message);
  // A malformed id (e.g. a stale client-side identity) is a client error, never a 500.
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id format. Please reload the page and try again.' });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
