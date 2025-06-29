const bcrypt = require('bcrypt');

const hash = "$2b$10$g69P/Sd4LP/M3V6zdRUqcOyWOTByvjtuNoS4CjiT.oTgGvNSh4M.i"; // hash da igreja VALLESSA
const senhaTeste = "VALLESSA123"; // senha que você quer testar

bcrypt.compare(senhaTeste, hash, (err, result) => {
  if (err) {
    console.error("Erro no bcrypt:", err);
  } else {
    console.log("Senha bate com hash?", result);
  }
});
