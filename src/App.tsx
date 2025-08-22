import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import "./App.css";
import ChatFilter from "./components/chat-filter";
import ChatViewer from "./components/chat-viewer";
import {
  filterChatList,
  isFiltered,
  type ChatFilter as ChatFilterData,
} from "./lib/chat-filter";
import { get_chat_player, type Chat } from "./lib/chat";
import MCLog2ChatMenubar from "./components/menubar";
import ChatLoadWorker from "./lib/chat-loader.worker?worker";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./components/ui/shadcn-io/dropzone";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { cn } from "./lib/utils";
import type { ChatLoaderInput, ChatLoaderOutput, ChatLoadingProgress } from "./lib/chat-loader.worker";
import LoadingCard from "./components/loading-card";

function App() {
  const [chatFilter, setChatFilter] = useState<ChatFilterData>({
    players: null,
    message: null,
    forced_mismatch: false,
  });

  const [chatList, setChatList] = useState<Chat[]>([]);
  const players = useMemo(
    () =>
      [
        ...new Set(
          chatList
            .map((chat) => get_chat_player(chat))
            .filter((player) => player != null)
        ),
      ].sort(),
    [chatList]
  );

  const [isChatLoading, startChatLoading] = useTransition();
  const [chatLoadingProgress, setChatLoadingProgress] = useState<ChatLoadingProgress | null>(null);
  // const [isChatLoading, setIsChatLoading] = useState(true);
  // function startChatLoading(f: () => void) {}

  const [filteredChatList, setFilteredChatList] = useState<Chat[]>([]);
  useEffect(() => {
    startChatLoading(() => {
      setFilteredChatList(
        isFiltered(chatFilter) ? filterChatList(chatList, chatFilter) : chatList
      );
    });
  }, [chatList, chatFilter]);

  // const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="h-screen pt-4 px-8 flex flex-col gap-4 overflow-hidden">
      <div className="text-5xl font-bold text-foreground">MC Log2Chat</div>
      <MCLog2ChatMenubar
        chatList={filteredChatList}
        isChatLoading={isChatLoading}
        setChatList={setChatList}
        startChatLoading={startChatLoading}
        setChatLoadingProgress={setChatLoadingProgress}
      />
      <ChatFilter
        filter={chatFilter}
        setFilter={setChatFilter}
        disabled={chatList.length === 0}
        players={players}
      />
      <div className={cn("w-full h-full", filteredChatList.length > 0 ? "overflow-scroll" : "overflow-hidden")}>
        <ChatViewer
          chatList={filteredChatList}
          filter={chatFilter}
          setFilter={setChatFilter}
          isLoading={isChatLoading}
        />
        {!isChatLoading && chatList.length === 0 && (
          <div className="h-full flex p-12 items-start justify-center">
            <Dropzone className="w-[50vw] py-12" maxSize={1024*1024*100} maxFiles={-1} accept={{
              "text/plain": [],
              ".log": [],
              ".gz": []
            }} onError={console.error}
              // src={files}
              onDrop={(files) => {
                // setFiles(files);
                setChatLoadingProgress(null);
                startChatLoading(async () => {
                  await new Promise<void>((resolve) => {
                    const loader = new ChatLoadWorker();
                    loader.postMessage({
                      type: "file",
                      files: files
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
                          resolve()
                          break;
                      }
                    })
                  });
                });
              }
            }>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>
        )}
        {isChatLoading && chatLoadingProgress != null && <LoadingCard progress={chatLoadingProgress} />}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
