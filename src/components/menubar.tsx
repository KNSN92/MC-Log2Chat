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
import { load_from_files } from "@/lib/chat-io";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MCLog2ChatMenubar({
  chatList,
  setChatList,
  startChatLoading,
}: {
  chatList: Chat[];
  setChatList: (chatList: Chat[]) => void;
  startChatLoading: (action: () => void) => void;
}) {
  const body_classes = document.body.classList;
  return (
    <Menubar className="w-fit">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={() => load_from_file_chooser(setChatList, startChatLoading)}>
            Load from file
          </MenubarItem>
          <MenubarItem onSelect={() => load_from_clipboard(setChatList, startChatLoading)}>
            Load from clipboard
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
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
              <MenubarItem onSelect={() => body_classes.remove("dark")}>
                <CheckIcon
                  className={cn(body_classes.contains("dark") && "opacity-0")}
                />
                White
              </MenubarItem>
              <MenubarItem onSelect={() => body_classes.add("dark")}>
                <CheckIcon
                  className={cn(!body_classes.contains("dark") && "opacity-0")}
                />
                Dark
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Font</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem
                onSelect={() => {
                  body_classes.remove("uni_font");
                  body_classes.add("mc_font");
                }}
              >
                <CheckIcon
                  className={cn(
                    !body_classes.contains("mc_font") && "opacity-0"
                  )}
                />
                Minecraft
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  body_classes.remove("mc_font");
                  body_classes.add("uni_font");
                }}
              >
                <CheckIcon
                  className={cn(
                    !body_classes.contains("uni_font") && "opacity-0"
                  )}
                />
                Unicode
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  body_classes.remove("uni_font");
                  body_classes.remove("mc_font");
                }}
              >
                <CheckIcon
                  className={cn(
                    (body_classes.contains("uni_font") ||
                      body_classes.contains("mc_font")) &&
                      "opacity-0"
                  )}
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

function load_from_file_chooser(setChatList: (chatList: Chat[]) => void, startChatLoading: (action: () => void) => void) {
  new Promise<FileList | null>((resolve) => {
    const file_chooser = document.createElement("input");
    file_chooser.type = "file";
    file_chooser.accept = "text/plain,.log";
    file_chooser.onchange = () => {
      resolve(file_chooser.files);
    };
    file_chooser.click();
  }).then((fileList) => {
    if (!fileList) return;
    startChatLoading(() => {
      load_from_files([...fileList]).then((chatList) => {
      setChatList(chatList);
    });
    })
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
