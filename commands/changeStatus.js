const https = require("https");
const fetch = require("node-fetch");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const changeStatus = async (type, data) => {
  try {
    console.log(type);
    const response = await fetch("https://apikazakovm.ru/api/changeStatus", {
      agent,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type_of_appointment: type,
        data: data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Ошибка сервера: ${response.status}`);
    }

    return { success: true, message: "✅ Статус заявки изменен", data: result };
  } catch (error) {
    console.log(data);
    console.error(error);
    return { success: false, message: `❌ Ошибка: ${error.message}` };
  }
};

const success = async (type, data) => {
  try {
    const response = await fetch("https://apikazakovm.ru/api/success", {
      agent,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type_of_appointment: type,
        data: data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Ошибка сервера: ${response.status}`);
    }

    return {
      success: true,
      message: "✅ Заявка успешно завершена",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: `❌ Ошибка: ${error.message}` };
  }
};

module.exports = { changeStatus, success };
