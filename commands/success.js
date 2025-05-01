const https = require("https");
const fetch = require("node-fetch");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const success = async (data) => {
  try {
    const response = await fetch("https://apikazakovm.ru/api/success", {
      agent,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return "✅ Успех";
  } catch (error) {
    console.error(error);
    return "❌ Ошибка завершения заявки";
  }
};
module.exports = { success };
