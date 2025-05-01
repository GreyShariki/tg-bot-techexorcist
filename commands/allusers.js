const allUsers = async (id) => {
  const response = await fetch("https://apikazakovm.ru/api/allusers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: id,
    }),
  });
  if (!response.ok) {
    return `Ошибка ${response.status}: ${response.statusText}`;
  }

  if (response.status === 200) {
    const data = await response.json();
    return data;
  }
};
module.exports = { allUsers };
