function concatName(firstName, lastName) {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';

  if (!first && !last) {
    return null;
  }

  if (first && last) {
    return `${first} ${last}`;
  }

  return first || last; // whichever exists
}

module.exports = concatName;