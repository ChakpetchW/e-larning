const bcrypt = require('bcryptjs');

const password = 'Genjironan.1';
const hash = '$2b$10$JlOh1Av.uU0z5ysq8ppWQOK3TXDpyOX0lnGjVQRG2PcaTkKvYbVLm';

bcrypt.compare(password, hash).then(result => {
  console.log('Match:', result);
});
