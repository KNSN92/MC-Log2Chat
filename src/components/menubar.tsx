import { get_chat, to_minecraft_style_string, type Chat } from "@/lib/chat";
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
import ChatLoadWorker from "@/lib/chat-loader.worker?worker";
import { get, set } from "@/lib/storage";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ChatLoaderInput, ChatLoaderOutput, ChatLoadingProgress } from "@/lib/chat-loader.worker";

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
          <MenubarItem disabled={isChatLoading} onSelect={() => load_from_file_chooser(setChatList, startChatLoading, setChatLoadingProgress)}>
            Load from file
          </MenubarItem>
          <MenubarItem disabled={isChatLoading} onSelect={() => load_from_clipboard(setChatList, startChatLoading)}>
            Load from clipboard
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            disabled={isChatLoading}
            onSelect={() => {
              download_chat_as_txt(chatList);
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

function load_from_file_chooser(setChatList: (chatList: Chat[]) => void, startChatLoading: (action: () => void) => void, setChatLoadingProgress: (progress: ChatLoadingProgress | null) => void) {
  new Promise<FileList | null>((resolve) => {
    const file_chooser = document.createElement("input");
    file_chooser.type = "file";
    file_chooser.accept = "text/plain,.log,.gz";
    file_chooser.multiple = true;
    file_chooser.onchange = () => {
      resolve(file_chooser.files);
    };
    file_chooser.click();
  }).then((fileList) => {
    if (!fileList) return;
    startChatLoading(async () => {
      await new Promise<void>((resolve) => {
        const loader = new ChatLoadWorker();
        loader.postMessage({
          type: "file",
          files: [...fileList],
        } satisfies ChatLoaderInput);
        loader.addEventListener("message", (e) => {
          const output = e.data as ChatLoaderOutput;
          switch(output.type) {
            case "progress":
              setChatLoadingProgress(output.progress);
              break;
            case "failed_files":
              toast("These files did not contain any chats or could not be read!", {
                description: output.failedFiles.reduce<ReactNode[]>((acc, value) => [...acc, <br/>, value], []).slice(1),
                duration: 10000,
              });
              break;
            case "result":
              setChatList(output.chatList);
              setChatLoadingProgress(null);
              resolve();
              break;
          }
        });
      })
    });
  });
}

function load_from_clipboard(setChatList: (chatList: Chat[]) => void, startChatLoading: (action: () => void) => void) {
  startChatLoading(() => {
    navigator.clipboard.readText().then((text) => {
      const chatList = text
        .split("\n")
        .map((line) => get_chat(line))
        .filter((chat) => chat !== null);
      setChatList(chatList);
    })
  });
}

function download_chat_as_txt(chatList: Chat[]) {
  const str_chat_list = chatList.map(to_minecraft_style_string).join("\n");
  const chat_file = new Blob([str_chat_list], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(chat_file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chatlist.txt";
  link.click();
  URL.revokeObjectURL(url);
}
