import { get_display_chat_player, type Chat } from "./chat";

export type ChatTypeFilter = {[chatType in Chat["type"]]: boolean};

export const ChatTypeFilterDefault: ChatTypeFilter = {
  advancement: false,
  death: false,
  join: false,
  leave: false,
  player: false,
  system: false,
  tell: false,
  unknown: false
}

export interface ChatFilter {
  players: string[] | null;
  players_filteling_mode: "whitelist" | "blacklist",
  chat_type: ChatTypeFilter | null,
  chat_type_filteling_mode: "whitelist" | "blacklist",
  message: string | RegExp | null;
  forced_mismatch: boolean
}

export function filterChatList(chatList: Chat[], filter: ChatFilter): Chat[] {
  if(filter.forced_mismatch) return [];
  if(filter.players == null && filter.chat_type == null && filter.message == null) return chatList;
  if(filter.players && filter.players.length > 0) {
    chatList = chatList.filter((chat) => filterPlayer(chat, filter.players!, filter.players_filteling_mode));
  }
  if(filter.chat_type != null) {
    chatList = chatList.filter((chat) => filterChatType(chat, filter.chat_type!, filter.chat_type_filteling_mode))
  }
  if(filter.message != null) {
    const message_filter = filter.message;
    if(typeof message_filter === "string") {
      chatList = chatList.filter((chat) => filterChatContains(chat, message_filter))
    }else {
      chatList = chatList.filter((chat) => filterChatRegex(chat, message_filter))
    }
  }
  return chatList;
}

function filterPlayer(chat: Chat, players: string[], mode: "whitelist" | "blacklist"): boolean {
  const player = get_display_chat_player(chat);
  if(!player) return false;
  if(mode === "whitelist") {
    return players.includes(player);
  }else {
    return !players.includes(player);
  }
}

function filterChatContains(chat: Chat, filter: string): boolean {
  return chat.message.includes(filter);
}

function filterChatRegex(chat: Chat, filter: RegExp): boolean {
  return chat.message.match(filter) != null;
}

function filterChatType(chat: Chat, filter: {[chatType in Chat["type"]]: boolean}, mode: "whitelist" | "blacklist"): boolean {
  const chat_type = chat.type;
  if(mode === "whitelist") {
    return filter[chat_type];
  }else {
    return !filter[chat_type];
  }
}

export function isFiltered(filter: ChatFilter) {
  return filter.players != null || filter.message != null || filter.chat_type != null;
}
