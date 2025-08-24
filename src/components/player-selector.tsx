import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { cn } from "@/lib/utils";

export default function PlayerSelector({
  players,
  playerFilteringMode,
  selectedPlayers,
  setSelectedPlayers,
  togglePlayerFilteringMode,
  disabled,
}: {
  players: string[];
  selectedPlayers: string[];
  playerFilteringMode: "whitelist" | "blacklist";
  setSelectedPlayers: (value: string[]) => void;
  togglePlayerFilteringMode: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  const sorted_players = [
    ...selectedPlayers,
    ...players.filter((player) => !selectedPlayers.includes(player)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[200px] justify-between"
        >
          {selectedPlayers.length > 0
            ? (playerFilteringMode === "whitelist" ? "" : "!") + selectedPlayers[0] + (selectedPlayers.length > 1 ? ", ..." : "")
            : "Select player..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search player..." />
          <CommandGroup heading="Settings">
            <CommandItem className="pl-6" onSelect={() => togglePlayerFilteringMode()}>
              <div className="mr-2 size4" />
              {playerFilteringMode === "whitelist" ? "Whitelist" : "Blacklist"}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandList>
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup heading="Players">
              {sorted_players.map((player, i) => (
                <CommandItem
                  key={i}
                  value={player}
                  onSelect={(currentValue) => {
                    if (selectedPlayers.includes(currentValue)) {
                      setSelectedPlayers(
                        selectedPlayers.filter(
                          (selectedPlayer) => selectedPlayer !== currentValue
                        )
                      );
                    } else {
                      setSelectedPlayers([...selectedPlayers, currentValue].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
                    }
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size4",
                      selectedPlayers.includes(player)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {player}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
