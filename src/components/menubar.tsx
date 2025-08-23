import { type Chat } from "@/lib/chat";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar";
import { get, set } from "@/lib/storage";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ChatLoadingProgress } from "@/lib/chat-loader.worker";
import { downloadChatAsTxt, loadFromFileChooser } from "@/lib/chat-io";

type Font = "default" | "unifont" | "mcfont";
type Theme = "light" | "dark";

export default function MCLog2ChatMenubar({
  chatList,
  isChatLoading,
  setChatList,
  startChatLoading,
  setChatLoadingProgress,
}: {
  chatList: Chat[];
  isChatLoading: boolean;
  setChatList: (chatList: Chat[]) => void;
  startChatLoading: (action: () => void) => void;
  setChatLoadingProgress: (progress: ChatLoadingProgress | null) => void;
}) {
  const body_classes = document.body.classList;

  const [font, setFont] = useState<Font>(get("font", "mcfont") as Font);
  useEffect(() => {
    set("font", font);
    body_classes.add(font);
    return () => body_classes.remove(font);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font]);

  const [theme, setTheme] = useState<Theme>(get("theme", "dark") as Theme);
  useEffect(() => {
    set("theme", theme);
    body_classes.add(theme);
    return () => body_classes.remove(theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  return (
    <Menubar className="w-fit">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled={isChatLoading} onSelect={() => {
            startChatLoading(async () => {
              const {chatList, failedFiles} = await loadFromFileChooser((progress) => setChatLoadingProgress(progress));
              if(failedFiles.length > 0) {
                toast("These files did not contain any chats or could not be read!", {
                  description: failedFiles.reduce<ReactNode[]>((acc, value) => [...acc, <br/>, value], []).slice(1),
                  duration: 10000,
                });
              }
              setChatList(chatList);
              setChatLoadingProgress(null);
            });
          }}>
            Load from file
          </MenubarItem>
          <MenubarItem disabled={isChatLoading || true} onSelect={() => {}}>
            Load from text (WIP)
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            disabled={isChatLoading || chatList.length === 0}
            onSelect={() => {
              downloadChatAsTxt(chatList);
            }}
          >
            Save as a text file
          </MenubarItem>
          {/* <MenubarItem>Save as a csv file</MenubarItem> */}
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Theme</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onSelect={() => setTheme("light")}>
                <CheckIcon className={cn(theme !== "light" && "opacity-0")}/>
                Light
              </MenubarItem>
              <MenubarItem onSelect={() => setTheme("dark")}>
                <CheckIcon className={cn(theme !== "dark" && "opacity-0")}/>
                Dark
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Font</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem
                onSelect={() => setFont("mcfont")}
              >
                <CheckIcon
                  className={cn(font !== "mcfont" && "opacity-0")}
                />
                Minecraft
              </MenubarItem>
              <MenubarItem
                onSelect={() => setFont("unifont")}
              >
                <CheckIcon
                  className={cn(font !== "unifont" && "opacity-0")}
                />
                Unicode
              </MenubarItem>
              <MenubarItem onSelect={() => setFont("default")}>
                <CheckIcon
                  className={cn(font !== "default" && "opacity-0")}
                />
                Default
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
