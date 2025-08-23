import { get_display_chat_player, type Chat } from "./chat";

export interface ChatFilter {
  players: string[] | null;
  message: string | RegExp | null;
  forced_mismatch: boolean
}

export function filterChatList(chatList: Chat[], filter: ChatFilter): Chat[] {
  if(filter.forced_mismatch) return [];
  if(filter.players == null && filter.message == null) return chatList;
  if(filter.players && filter.players.length > 0) {
    chatList = chatList.filter((chat) => {
      const player = get_display_chat_player(chat);
      return player && filter.players!.includes(player);
    });
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

function filterChatContains(chat: Chat, filter: string): boolean {
  return chat.message.includes(filter);
}

function filterChatRegex(chat: Chat, filter: RegExp): boolean {
  return chat.message.match(filter) != null;
}

export function isFiltered(filter: ChatFilter) {
  return filter.players != null || filter.message != null;
}
