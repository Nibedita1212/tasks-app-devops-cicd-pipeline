function validateTitle(title) {
  if (typeof title !== 'string') return false;
  const t = title.trim();
  return t.length > 0 && t.length <= 100;
}
module.exports = { validateTitle };
