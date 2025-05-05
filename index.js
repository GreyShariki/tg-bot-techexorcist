const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const { BOT_TOKEN, API_KEY } = require("./config.json");
const { askDeepSeek } = require("./commands/openai.js");
const bot = new Telegraf(BOT_TOKEN);
const { techRequest } = require("./commands/TechEquipment.js");
const { allUsers } = require("./commands/allusers.js");
const { deleteUser } = require("./commands/deleteUser.js");
const { allRequests } = require("./commands/allRequests.js");
const { changeStatus, success } = require("./commands/changeStatus.js");
const webappUrl = "https://incomparable-medovik-4eb827.netlify.app/";
bot.start((ctx) =>
  ctx.reply(
    "Добро пожаловать в TechExorcist. Опиши поломку или напиши /help для получения списка команд."
  )
);

bot.help((ctx) =>
  ctx.reply(
    "👨‍🦽/bot - Спросить у нашего китайского друга\n💼/allRequests - Cписок всех заявок\n🧙‍♂️/allusers - Список всех пользователей (Только для администратора)\n🦹🏼‍♂️/deleteUser - Удалить пользователя по id"
  )
);
bot.command("deleteUser", async (ctx) => {
  ctx.reply("Введите айди пользователя (id)");
  const textHandler = async (ctx) => {
    if (!/^\d+$/.test(ctx.message.text)) {
      return ctx.reply("Ошибка: ID должен быть числом. Попробуйте ещё раз.");
    }

    const data = await deleteUser(ctx.from.id, ctx.message.text.trim());
    await ctx.reply(data);
    bot.off("text", textHandler); // Важно: отключаем обработчик
  };

  bot.once("text", textHandler);
});
bot.command("allusers", async (ctx) => {
  const data = await allUsers(ctx.from.id);
  if (typeof data === "string") {
    ctx.reply(data);
  } else {
    Array.from(data).forEach((user) => {
      ctx.reply(
        `👤 *Информация о пользователе*\n\n` +
          `🆔 ID: ${user.id}\n` +
          `👤 Имя: ${user.fname || "Не указано"}\n` +
          `👥 Фамилия: ${user.lname || "Не указана"}\n` +
          `💬 Chat ID: ${user.chat_id}\n` +
          `🎭 Роль: ${user.role}\n`
      );
    });
  }
});
bot.command("test", async (ctx) => {
  const testRequest = {
    type_of_device: "Тестовая заявка",
    number: "Это тестовая заявка, созданная через команду бота",
    status: "На рассмотрении",
    chat_id: ctx.from.id,
    type_of_failure: "Стал очень умным",
    description: "А чё он умнее меня",
  };
  const res = await techRequest(testRequest);
  ctx.reply(res[1]);
  res[0][1].forEach((master) => {
    const application = res[0][0];
    bot.telegram.sendMessage(
      master.chat_id,
      `🚨 Новая заявка #${application.id}\n\n` +
        `📱 Устройство: ${application.type_of_device}\n` +
        `🔢 Номер: ${application.number}\n` +
        `⚠️ Тип проблемы: ${application.type_of_failure}\n` +
        `📝 Описание: ${application.description}\n` +
        `🔄 Статус: ${application.status}`
    );
  });
});
bot.command("allRequests", async (ctx) => {
  try {
    const requests = await allRequests(ctx.from.id);
    if (!requests) {
      return await ctx.reply("❌ Произошла ошибка при получении заявок");
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    if (requests.access?.length > 0) {
      await ctx.reply("🔑 *Заявки на доступ*", { parse_mode: "Markdown" });

      for (const req of requests.access) {
        await ctx.replyWithHTML(
          `<b>ID:</b> <code>${req.id}</code>\n` +
            `<b>Тип доступа:</b> ${req.access_type}\n` +
            `<b>От:</b> ${req.fname} ${req.lname}\n` +
            `<b>Обоснование:</b> ${req.description}\n` +
            `<b>Статус:</b> ${req.status}\n` +
            `<b>Дата:</b> ${formatDate(req.createdAt)}\n` +
            `<i>Chat ID: ${req.chat_id}</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Отклонить",
                    callback_data: `reject_access_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "✅ Принять",
                    callback_data: `accept_access_${req.id}_${req.status}_${req.chat_id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else if ("access" in requests) {
      await ctx.reply("ℹ️ Заявок на доступ нет");
    }

    if (requests.tech?.length > 0) {
      await ctx.reply("🛠️ *Технические заявки*", { parse_mode: "Markdown" });

      for (const req of requests.tech) {
        await ctx.replyWithHTML(
          `<b>ID:</b> <code>${req.id}</code>\n` +
            `<b>Устройство:</b> ${req.type_of_device}\n` +
            `<b>Номер:</b> ${req.number}\n` +
            `<b>Проблема:</b> ${req.type_of_failure}\n` +
            `<b>Описание:</b> ${req.description}\n` +
            `<b>Статус:</b> ${req.status}\n` +
            `<b>Дата:</b> ${formatDate(req.createdAt)}\n` +
            `<i>Chat ID: ${req.chat_id}</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Отклонить",
                    callback_data: `reject_tech_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "🔄 Принять",
                    callback_data: `accept_tech_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "✅ Завершить",
                    callback_data: `reject_tech_${req.id}_${req.status}_${req.chat_id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else if ("tech" in requests) {
      await ctx.reply("ℹ️ Технических заявок нет");
    }

    if (requests.network?.length > 0) {
      await ctx.reply("🌐 *Сетевые заявки*", { parse_mode: "Markdown" });

      for (const req of requests.network) {
        await ctx.replyWithHTML(
          `<b>ID:</b> <code>${req.id}</code>\n` +
            `<b>Локация:</b> ${req.location}\n` +
            `<b>Тип соединения:</b> ${req.connectionType}\n` +
            `<b>Симптомы:</b> ${req.signsStr}\n` +
            `<b>Началось:</b> ${formatDate(req.startTime)}\n` +
            `<b>Статус:</b> ${req.status}\n` +
            `<b>Дата заявки:</b> ${formatDate(req.createdAt)}\n` +
            `<i>Chat ID: ${req.chat_id}</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Отклонить",
                    callback_data: `reject_net_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "🔄 Принять в работу",
                    callback_data: `accept_net_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "✅ Завершить",
                    callback_data: `reject_net_${req.id}_${req.status}_${req.chat_id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else if ("network" in requests) {
      await ctx.reply("ℹ️ Сетевых заявок нет");
    }

    if (requests.office?.length > 0) {
      await ctx.reply("🛒 *Заявки на расходники*", { parse_mode: "Markdown" });

      for (const req of requests.office) {
        await ctx.replyWithHTML(
          `<b>ID:</b> <code>${req.id}</code>\n` +
            `<b>Товар:</b> ${req.item}\n` +
            `<b>Количество:</b> ${req.quantity}\n` +
            `<b>Локация:</b> ${req.location}\n` +
            `<b>Статус:</b> ${req.status}\n` +
            `<b>Дата:</b> ${formatDate(req.createdAt)}\n` +
            `<i>Chat ID: ${req.chat_id}</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Отклонить",
                    callback_data: `reject_office_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "🔄 Принять в работу",
                    callback_data: `accept_office_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "✅ Завершить",
                    callback_data: `reject_office_${req.id}_${req.status}_${req.chat_id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else if ("office" in requests) {
      await ctx.reply("ℹ️ Заявок на расходники нет");
    }

    if (requests.other?.length > 0) {
      await ctx.reply("📌 *Прочие заявки*", { parse_mode: "Markdown" });

      for (const req of requests.other) {
        console.log(
          "callback_data:",
          `reject_other_${req.id}_${req.status}_${req.chat_id}`
        );
        await ctx.replyWithHTML(
          `<b>ID:</b> <code>${req.id}</code>\n` +
            `<b>Категория:</b> ${req.category}\n` +
            `<b>Срочность:</b> ${req.urgency}\n` +
            `<b>Описание:</b> ${req.description}\n` +
            `<b>Статус:</b> ${req.status}\n` +
            `<b>Дата:</b> ${formatDate(req.createdAt)}\n`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Отклонить",
                    callback_data: `reject_other_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "🔄 Принять в работу",
                    callback_data: `accept_other_${req.id}_${req.status}_${req.chat_id}`,
                  },
                  {
                    text: "✅ Завершить",
                    callback_data: `reject_other_${req.id}_${req.status}_${req.chat_id}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } else if ("other" in requests) {
      await ctx.reply("ℹ️ Прочих заявок нет");
    }
  } catch (error) {
    console.error("Ошибка в команде allRequests:", error);
    await ctx.reply("❌ Произошла ошибка при обработке запроса");
  }
});
bot.command("bot", async (ctx) => {
  await ctx.reply("Что вы хотите спросить у китайского друга?");

  try {
    const textHandler = async (ctx) => {
      if (ctx.message.text.startsWith("/")) return;

      const aiResponse = await askDeepSeek(ctx.message.text, API_KEY);
      await ctx.reply(aiResponse, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📝 Создать заявку", web_app: { url: webappUrl } }],
          ],
        },
      });
      bot.off("text", textHandler);
    };
    bot.once("text", textHandler);
  } catch (error) {
    console.error("Error in bot command:", error);
    await ctx.reply("Время ожидания истекло или произошла ошибка");
  }
});
bot.action(
  /^(accept|reject)_(tech|net|office|access|other)_(\d+)_([^_]+)_(\d+)$/,
  async (ctx) => {
    const action = ctx.match[1];
    const type = ctx.match[2];
    const id = ctx.match[3];
    const status = ctx.match[4];
    const chat_id = ctx.match[5];
    console.log(type);
    try {
      let typeForServer;
      switch (type) {
        case "tech":
          typeForServer = "Техническая заявка";
          break;
        case "net":
          typeForServer = "Сетевая заявка";
          break;
        case "office":
          typeForServer = "Офис";
          break;
        case "access":
          typeForServer = "Доступ";
          break;
        case "other":
          typeForServer = "Другое";
          break;
      }

      if (action === "accept") {
        const result = await changeStatus(typeForServer, {
          id,
          status,
          chat_id,
        });

        if (result.success) {
          await ctx.answerCbQuery(result.message);
          await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
          const messageText =
            ctx.update.callback_query.message.text +
            `\n\n🔄 Статус: В процессе (принято ${ctx.from.first_name})`;
          await ctx.editMessageText(messageText, { parse_mode: "HTML" });
        } else {
          await ctx.answerCbQuery(`❌ Ошибка: ${result.message}`);
        }
      } else {
        const result = await success(typeForServer, { id });

        if (result.success) {
          if (typeForServer === "Доступ") {
            await ctx.answerCbQuery("✅ Отказано в доступе");
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            const messageText =
              ctx.update.callback_query.message.text +
              `\n\n❌ Статус: Отказано в доступе (${ctx.from.first_name})`;
            await ctx.editMessageText(messageText, { parse_mode: "HTML" });
          } else {
            await ctx.answerCbQuery("✅ Заявка завершена");
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

            const messageText =
              ctx.update.callback_query.message.text +
              `\n\n✅ Статус: Завершено (${ctx.from.first_name})`;
            await ctx.editMessageText(messageText, { parse_mode: "HTML" });
          }
        } else {
          await ctx.answerCbQuery(`❌ Ошибка: ${result.message}`);
        }
      }
    } catch (error) {
      console.error(`Ошибка обработки заявки ${type}-${id}:`, error);
      await ctx.answerCbQuery("❌ Произошла ошибка при обработке");
    }
  }
);

bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

bot.hears("Привет", (ctx) => ctx.reply("И тебе того же"));
bot.launch();
