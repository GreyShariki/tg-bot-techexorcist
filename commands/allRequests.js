const fetch = require("node-fetch");

const allRequests = async (id) => {
  try {
    const response = await fetch("https://apikazakovm.ru/api/allRequests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при получении заявок:", error);
    return null;
  }
};
module.exports = { allRequests };
