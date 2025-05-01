const techRequest = async (techRequest) => {
  try {
    const response = await fetch("https://apikazakovm.ru/api/addtech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        techRequest,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    const data = await response.json();
    const result = [data, "✅ Тестовая заявка создана! Мастера уведомлены."];
    return result;
  } catch (error) {
    console.error(error);
    return "❌ Ошибка при создании тестовой заявки";
  }
};
module.exports = { techRequest };
