
export interface Chat {
  type: "player" | "system" | "tell" | "joinleft" | "unknown";
  time: ChatTime;
  player: string;
  message: string;
};

export interface ChatTime {
  year?: number,
  month?: number,
  day?: number,

  hour: number,
  minute: number,
  second: number,
}

export function chatTimeToString(chatTime: ChatTime) {
  const year = chatTime.year?.toString().padStart(4, "0");
  const month = chatTime.month?.toString().padStart(2, "0");
  const day = chatTime.day?.toString().padStart(2, "0");

  const hour = chatTime.hour?.toString().padStart(2, "0");
  const minute = chatTime.minute?.toString().padStart(2, "0");
  const second = chatTime.second?.toString().padStart(2, "0");

  if(year && month && day) {
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  }else {
    return `${hour}:${minute}:${second}`;
  }
}

const CHAT_LOG_REGEX = /^\[(?<Time>\d\d:\d\d:\d\d)]\s\[.*?]:\s(?<System>\[System]\s)?\[CHAT]\s(<(?<Player>[_a-zA-Z0-9]+)>\s)?(?<Message>.+)$/;

export function get_chat(line: string): Chat | null {
  const matched = line.trim().match(CHAT_LOG_REGEX);
  if(!matched?.groups) return null;
  const [ hours, minutes, seconds ] = matched.groups.Time.split(":").map((value) => parseInt(value));
  const is_system = matched.groups.System !== undefined;
  const player = is_system ? "[System]" : matched.groups.Player == null ? "[Unknown]" : matched.groups.Player;
  const message = matched.groups.Message;
  return {
    type: "player",
    time: { hour: hours, minute: minutes, second: seconds },
    player,
    message
  }
}

export function to_minecraft_style_string(chat: Chat): string {
  const elements: string[] = [];

  elements.push("["+chatTimeToString(chat.time)+"]");
  if(!(chat.player.startsWith("[") && chat.player.endsWith("]"))) {
    elements.push("<"+chat.player+">");
  }
  elements.push(chat.message);
  return elements.join(" ");
}
