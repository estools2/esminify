const joinStr = (data) => {
  let str = '';
  try {
    str = str + data.join(' ');
  } catch (error) {
    const dataLength = data.length;
    str += error.message + dataLength;
  }
  return str;
};