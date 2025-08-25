import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/lib/chat";
import { ChatTypeFilterDefault, type ChatTypeFilter } from "@/lib/chat-filter";

export default function ChatTypeSelector({
  selectedChatTypes,
  chatTypeFilteringMode,
  setSelectedChatTypes,
  togglePlayerFilteringMode,
  disabled,
}: {
  selectedChatTypes: ChatTypeFilter | null;
  chatTypeFilteringMode: "whitelist" | "blacklist";
  setSelectedChatTypes: (value: ChatTypeFilter | null) => void;
  togglePlayerFilteringMode: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedChatTypeList = selectedChatTypes
    ? Object.entries(selectedChatTypes)
        .filter(([_, selected]) => selected)
        .map(([chatType]) => chatType)
    : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[20vw] min-w-fit max-w-[200px] justify-between"
        >
          {selectedChatTypeList.length > 0
            ? (chatTypeFilteringMode === "whitelist" ? "" : "!") +
              selectedChatTypeList[0] +
              (selectedChatTypeList.length > 1 ? ", ..." : "")
            : "Select chat type..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup heading="Settings">
            <CommandItem
              className="pl-6"
              onSelect={() => togglePlayerFilteringMode()}
            >
              <div className="mr-2 size4" />
              {chatTypeFilteringMode === "whitelist"
                ? "Whitelist"
                : "Blacklist"}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandList>
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup heading="Chat Types">
              {(Object.keys(ChatTypeFilterDefault) as ChatType[])
                .sort()
                .map((chatType, i) => (
                  <CommandItem
                    key={i}
                    value={chatType}
                    onSelect={(currentValue) => {
                      const newSelectedChatTypes: ChatTypeFilter =
                        selectedChatTypes
                          ? {
                              ...selectedChatTypes,
                            }
                          : { ...ChatTypeFilterDefault };
                      if (
                        Object.keys(newSelectedChatTypes).includes(currentValue)
                      ) {
                        const chatType = currentValue as ChatType;
                        newSelectedChatTypes[chatType] =
                          !newSelectedChatTypes[chatType];
                        if (
                          Object.values(newSelectedChatTypes).some((v) => v)
                        ) {
                          setSelectedChatTypes(newSelectedChatTypes);
                        } else {
                          setSelectedChatTypes(null);
                        }
                      }
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size4",
                        selectedChatTypes && selectedChatTypes[chatType]
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {chatType}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
