import langJson from "../assets/lang.json";

type LangType = {
  death: RegExp[],
  join: RegExp[],
  leave: RegExp[],
  tell_from: RegExp[]
  tell_to: RegExp[],
  advancement: RegExp[],
}

const lang: LangType = {
  death: [],
  join: [],
  leave: [],
  tell_from: [],
  tell_to: [],
  advancement: [],
};
for(const entry of Object.entries(langJson)) {
  const key = entry[0] as keyof LangType;
  lang[key] = entry[1].map((v) => new RegExp(v));
}

export type Chat = {
  time: ChatTime;
  message: string;
} & (
  {
    type: "player";
    player: string;
  } | {
    type: "system" | "unknown";
  } | {
    type: "tell";
    sender: string;
    receiver: string;
  } | {
    type: "join";
    player: string;
    old_name?: string;
  } | {
    type: "leave";
    player: string;
  } | {
    type: "death";
    player: string;
    by?: string;
    item?: string;
  } | {
    type: "advancement";
    advancement: string;
    player: string;
  }
);

export type ChatType = Chat["type"];

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

  const hour = chatTime.hour.toString().padStart(2, "0");
  const minute = chatTime.minute.toString().padStart(2, "0");
  const second = chatTime.second.toString().padStart(2, "0");

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
  const player = matched.groups.Player || null;

  const time: ChatTime = { hour: hours, minute: minutes, second: seconds };
  const message = matched.groups.Message.trim();
  if(!is_system && player != null) {
    return {
      type: "player",
      time,
      message: message,
      player
    }
  }else if(is_system) {
    for(const death_msg_matcher of lang.death) {
      const death_match = message.match(death_msg_matcher);
      if(!death_match) continue;
      return {
        type: "death",
        time,
        message: message,
        player: death_match.groups!.Player!,
      }
    }
    for(const join_msg_matcher of lang.join) {
      const join_match = message.match(join_msg_matcher);
      if(!join_match) continue;
      return {
        type: "join",
        time,
        message: message,
        player: join_match.groups!.Player!,
        old_name: join_match.groups!.OldName || undefined,
      }
    }
    for(const leave_msg_matcher of lang.leave) {
      const leave_match = message.match(leave_msg_matcher);
      if(!leave_match) continue;
      return {
        type: "leave",
        time,
        message: message,
        player: leave_match.groups!.Player!,
      }
    }
    for(const advancement_msg_matcher of lang.advancement) {
      const advancement_match = message.match(advancement_msg_matcher);
      if(!advancement_match) continue;
      return {
        type: "advancement",
        time,
        message: message,
        player: advancement_match.groups!.player,
        advancement: advancement_match.groups!.advancement,
      }
    }
    return {
      type: "system",
      time,
      message: message,
    }
  }else {
    for(const tell_from_msg_matcher of lang.tell_from) {
      const tell_from_match = message.match(tell_from_msg_matcher);
      if(!tell_from_match) continue;
      return {
        type: "tell",
        time,
        message: message,
        sender: tell_from_match.groups!.Sender!,
        receiver: "[You]"
      }
    }
    for(const tell_to_msg_matcher of lang.tell_to) {
      const tell_to_match = message.match(tell_to_msg_matcher);
      if(!tell_to_match) continue;
      return {
        type: "tell",
        time,
        message: message,
        sender: "[You]",
        receiver: tell_to_match.groups!.Receiver!,
      }
    }
    return {
      type: "unknown",
      time,
      message: message,
    }
  }
}

export function get_chat_player(chat: Chat): string | null {
  switch(chat.type) {
    case "player":
      return chat.player;
    case "system":
      return null;
    case "death":
      return chat.player;
    case "join":
      return chat.player;
    case "leave":
      return chat.player;
    case "tell":
      return chat.sender;
    case "advancement":
      return chat.player;
    case "unknown":
      return null;
  }
}

export function get_display_chat_player(chat: Chat): string {
  switch(chat.type) {
    case "player":
      return chat.player;
    case "system":
      return "[System]";
    case "death":
      return chat.player;
    case "join":
      return chat.player;
    case "leave":
      return chat.player;
    case "tell":
      return chat.sender;
    case "advancement":
      return chat.player;
    case "unknown":
      return "[Unknown]";
  }
}

export function to_minecraft_style_string(chat: Chat): string {
  const elements: string[] = [];

  elements.push("["+chatTimeToString(chat.time)+"]");
  if(chat.type === "player") {
    elements.push("<"+chat.player+">");
  }
  elements.push(chat.message);
  return elements.join(" ");
}
