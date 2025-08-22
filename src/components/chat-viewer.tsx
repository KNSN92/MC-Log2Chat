import {
  chatTimeToString,
  get_chat_player,
  get_display_chat_player,
  type Chat,
} from "@/lib/chat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";
import { ChatViewerSkeleton } from "./skeleton";
import { Button } from "./ui/button";
import type { ChatFilter } from "@/lib/chat-filter";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function ChatViewer({
  chatList,
  filter,
  setFilter,
  isLoading: isPending,
}: {
  chatList: Chat[];
  filter: ChatFilter;
  setFilter: (filter: ChatFilter) => void;
  isLoading: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const debouncedSetHoverIndex = useDebouncedCallback(setHoverIndex, 500);
  const existsHasDateChat =
    chatList.find(
      (chat) =>
        chat.time.year != null &&
        chat.time.month != null &&
        chat.time.day != null
    ) !== undefined;
  const chatElementList = chatList.map((chat, i) => {
    const player = get_display_chat_player(chat);
    const isHovered = i === hoverIndex;

    let playerElement;
    if (get_chat_player(chat) == null) {
      playerElement = <span className="text-nowrap overflow-hidden overflow-ellipsis">{player}</span>;
    } else {
      playerElement = (
        <Button
          variant="link"
          className="px-0 w-full h-fit py-0 justify-start cursor-pointer text-nowrap overflow-ellipsis"
          onClick={() => {
            const player = get_chat_player(chat);
            if (player == null) return;
            const selectedPlayers = filter.players ?? [];
            if (selectedPlayers.includes(player)) return;
            setFilter({
              ...filter,
              players: [...selectedPlayers, player].sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase())
              ),
            });
          }}
        >
          {player}
        </Button>
      );
      if (isHovered) {
        playerElement = (
          <Tooltip>
            <TooltipTrigger asChild>{playerElement}</TooltipTrigger>
            <TooltipContent>Add to filter</TooltipContent>
          </Tooltip>
        );
      }
    }

    const chatRow = (
      <TableRow key={i} onMouseEnter={() => debouncedSetHoverIndex(i)}>
        <TableCell className={cn("text-nowrap overflow-hidden overflow-ellipsis")}>
          {playerElement}
        </TableCell>
        <TableCell className="text-nowrap overflow-hidden overflow-ellipsis">
          {chatTimeToString(chat.time)}
        </TableCell>
        <TableCell
          className={cn(
            "text-nowrap overflow-hidden overflow-ellipsis",
            chat_color_class(chat.type),
            // chat_shadow_color_class(chat.type)
          )}
        >
          {chat.message}
        </TableCell>
      </TableRow>
    );
    if (isHovered) {
      return (
        <HoverCard openDelay={0} key={i}>
          <HoverCardTrigger asChild>{chatRow}</HoverCardTrigger>
          <HoverCardContent className="w-[60vw]">
            <div className="space-y-1">
              <h4>
                {player}
                <span className="inline-block w-4" />[
                {chatTimeToString(chat.time)}]
              </h4>
              <p
                className={cn("text-wrap break-words", chat_color_class(chat.type))}
              >
                {chat.message}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    } else {
      return chatRow;
    }
  });
  return (
    <Table className="table-fixed w-full">
      <TableHeader className="w-full">
        <TableRow className="w-full">
          <TableHead className="w-32">Player</TableHead>
          <TableHead className={cn(existsHasDateChat ? "w-48" : "w-24")}>
            Time
          </TableHead>
          <TableHead className="w-auto">Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className={cn("w-full h-full", !isPending && chatElementList.length === 0 && "hidden")}>
        {isPending ? (
          <>
            <ChatViewerSkeleton />
            <ChatViewerSkeleton />
            <ChatViewerSkeleton />
          </>
        ) : (
          chatElementList
        )}
      </TableBody>
    </Table>
  );
}

function chat_color_class(chat_type: Chat["type"]): string | null {
  switch(chat_type) {
    case "death":
      return "text-[#ff5555]";
    case "join":
      return "text-[#ffff55]";
    case "leave":
      return "text-[#ffff55]";
    case "tell":
      return "text-[#aaaaaa]";
    case "advancement":
      return "text-[#ff55ff]";
    default:
      return null;
  }
}

// function chat_shadow_color_class(chat_type: Chat["type"]): string | null {
//   switch(chat_type) {
//     case "death":
//       return "text-shadow-[#3f1515]";
//     case "join":
//       return "text-shadow-[#3f3f15]";
//     case "leave":
//       return "text-shadow-[#3f3f15]";
//     case "tell":
//       return "text-shadow-[#2a2a2a]";
//     case "advancement":
//       return "text-shadow-[#3f153f]";
//     default:
//       return null;
//   }
// }