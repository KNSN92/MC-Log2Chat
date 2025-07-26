import type { ChatFilter } from "@/lib/chat-filter";
import PlayerSelector from "./player-selector";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ChatFilter({
  filter,
  setFilter,
  disabled,
  players,
}: {
  filter: ChatFilter;
  setFilter: (filter: ChatFilter) => void;
  disabled: boolean;
  players: string[];
}) {
  const [searchText, setSearchText] = useState<string | null>(null);
  const [useRegex, setUseRegex] = useState(false);

  useEffect(() => {
    let message: string | RegExp | null = null;
    if (searchText) {
      if (useRegex) {
        try {
          message = new RegExp(searchText);
        } catch (e) {
          if (e instanceof SyntaxError) {
            setFilter({
              ...filter,
              forced_mismatch: true,
            });
            return;
          }
          console.error(e);
        }
      } else {
        message = searchText;
      }
    }
    setFilter({
      ...filter,
      message,
      forced_mismatch: false,
    });
  }, [searchText, useRegex]);

  useEffect(() => {
    setFilter({
      ...filter,
      players:
        filter.players?.filter((player) => players.includes(player)) || null,
    });
  }, [players]);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        disabled && "cursor-not-allowed"
      )}
    >
      <PlayerSelector
        players={players}
        selectedPlayers={filter.players ?? []}
        setSelectedPlayers={(selectedPlayers) => {
          setFilter({
            ...filter,
            players: selectedPlayers,
          });
        }}
        disabled={disabled}
      />
      <Input
        type="text"
        placeholder="Search text in message..."
        disabled={disabled}
        onChange={(e) =>
          setSearchText(e.target.value === "" ? null : e.target.value)
        }
      />
      <Checkbox
        id="use-regex"
        disabled={disabled}
        onCheckedChange={(checked) => {
          if (checked) {
            setUseRegex(true);
          } else {
            setUseRegex(false);
          }
        }}
      />
      <Label htmlFor="use-regex">Regex</Label>
    </div>
  );
}
