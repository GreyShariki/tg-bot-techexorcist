const https = require("https");
const fetch = require("node-fetch");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
const deleteUser = async (admin_id, id) => {
  const response = await fetch("https://apikazakovm.ru/api/deleteUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: admin_id,
      user_id: id,
    }),
  });
  if (!response.ok) {
    return `Ошибка ${response.status}: ${response.statusText}`;
  }

  if (response.status === 200) {
    return `Пользователь успешно удален`;
  }
};
module.exports = { deleteUser };
