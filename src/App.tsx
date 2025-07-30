import { useEffect, useMemo, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
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
import { load_from_files as load_chat_from_files } from "./lib/chat-io";

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
          chatList.map((chat) => get_chat_player(chat)).filter((player) => player != null)
        ),
      ].sort(),
    [chatList]
  );

  
  const [isChatLoading, startChatLoading] = useTransition();
  const { getRootProps } = useDropzone({
    onDrop(acceptedFiles) {
      startChatLoading(async () => {
        const loadedChatList = await load_chat_from_files(acceptedFiles);
        setChatList(loadedChatList);
      })
    },
  });
  
  const [filteredChatList, setFilteredChatList] = useState<Chat[]>([]);
  useEffect(() => {
    startChatLoading(() => {
      setFilteredChatList(
        isFiltered(chatFilter) ? filterChatList(chatList, chatFilter) : chatList
      );
    });
  }, [chatList, chatFilter]);

  return (
    <div {...getRootProps()} className="h-screen pt-4 px-8 flex flex-col gap-4 overflow-hidden">
      <div className="text-5xl font-bold text-foreground">MC Log2Chat</div>
      <MCLog2ChatMenubar
        chatList={filteredChatList}
        setChatList={setChatList}
        startChatLoading={startChatLoading}
      />
      <ChatFilter
        filter={chatFilter}
        setFilter={setChatFilter}
        disabled={chatList.length === 0}
        players={players}
      />
      <ChatViewer chatList={filteredChatList} filter={chatFilter} setFilter={setChatFilter} isPending={isChatLoading} />
    </div>
  );
}

export default App;
