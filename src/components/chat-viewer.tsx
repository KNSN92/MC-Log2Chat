import { chatTimeToString, type Chat } from "@/lib/chat";
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

export default function ChatViewer({ chatList }: { chatList: Chat[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const debouncedSetHoverIndex = useDebouncedCallback(setHoverIndex, 500);
  const exists_has_date_chat =
    chatList.find(
      (chat) =>
        chat.time.year != null &&
        chat.time.month != null &&
        chat.time.day != null
    ) !== undefined;
  return (
    <Table className="table-fixed w-full">
      <TableHeader className="w-full">
        <TableRow className="w-full">
          <TableHead className="w-32">Player</TableHead>
          <TableHead className={cn(exists_has_date_chat ? "w-48" : "w-24")}>
            Time
          </TableHead>
          <TableHead className="w-auto">Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="h-full overflow-y-auto">
        {chatList.map((chat, i) => {
          const isHovered = i === hoverIndex;
          const chatRow = (
            <TableRow key={i} onMouseEnter={() => debouncedSetHoverIndex(i)}>
              <TableCell className="text-nowrap overflow-hidden overflow-ellipsis">
                {chat.player}
              </TableCell>
              <TableCell className="text-nowrap overflow-hidden overflow-ellipsis">
                {chatTimeToString(chat.time)}
              </TableCell>
              <TableCell className="text-nowrap overflow-hidden overflow-ellipsis">
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
                      <a href={"https://namemc.com/profile/" + chat.player}>
                        {chat.player}
                      </a>
                      {chat.player && <span className="inline-block w-4" />}[
                      {chatTimeToString(chat.time)}]
                    </h4>
                    <p className="text-wrap break-words">{chat.message}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          } else {
            return chatRow;
          }
        })}
      </TableBody>
    </Table>
  );
}
