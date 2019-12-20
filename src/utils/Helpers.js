/**
 * Chunk an array in parts
 * @param array
 * @param size
 * @returns {Array}
 */
const chunk = (array, size) => {
  let tmp = [];
  for (let index = 0,length = array.length; index < length; index += size) {
    tmp.push(array.slice(index, index + size));
  }
  return tmp;
};

export {
  chunk
}
