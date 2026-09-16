import ConversationApi from 'dashboard/api/inbox/conversation';

export const conversacionesPropias = async signal => {
  const lista = [];
  let page = 1;
  let total;

  do {
    // Pagination metadata belongs to the preceding response.
    // eslint-disable-next-line no-await-in-loop
    const { data } = await ConversationApi.get({
      status: 'open',
      assigneeType: 'me',
      page,
    });
    if (signal.aborted) return undefined;
    const { payload, meta } = data.data;
    lista.push(...payload);
    total = meta.mine_count;
    if (!payload.length) break;
    page += 1;
  } while (lista.length < total);

  return lista;
};
