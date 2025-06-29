const bcrypt = require('bcrypt');

const senha = "VALLESSA123";  // coloque aqui a senha correta que você quer usar

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) {
    console.error("Erro ao gerar hash:", err);
    return;
  }
  console.log("Hash gerado:", hash);
});
