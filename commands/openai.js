const askDeepSeek = async (userMessage, API_KEY) => {
  try {
    const aiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          {
            role: "system",
            content:
              "Ты – TechExorcist, бот-помощник для IT-проблем. Отвечай советом, как бонус можешь рассказать шутку для хорошего настроения на день, а если проблема сложная – предложи создать заявку.",
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "Сегодня наш экзорцист на перекуре, попросите позже";
  }
};
module.exports = { askDeepSeek };
