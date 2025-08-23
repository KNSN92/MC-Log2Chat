import type { ChatLoaderInput, ChatLoaderOutput, ChatLoadingProgress } from "./chat-loader.worker";
import ChatLoadWorker from "@/lib/chat-loader.worker?worker";
import { to_minecraft_style_string, type Chat } from "./chat";

export async function loadFromText(text: string, onProgress?: (progress: ChatLoadingProgress) => void) {
	return await new Promise<Chat[]>((resolve) => {
		const loader = new ChatLoadWorker();
		loader.postMessage({
			type: "text",
			text
		} satisfies ChatLoaderInput);
		loader.addEventListener("message", (e) => {
			const output = e.data as ChatLoaderOutput;
			switch(output.type) {
				case "progress":
					onProgress?.(output.progress);
					break;
				case "result":
					resolve(output.chatList);
					break;
			}
		});
	});
}

export async function loadFromFiles(files: File[], onProgress?: (progress: ChatLoadingProgress) => void) {
	return await new Promise<{chatList: Chat[], failedFiles: string[]}>((resolve) => {
		const loader = new ChatLoadWorker();
		loader.postMessage({
			type: "file",
			files: files
		} satisfies ChatLoaderInput);
		let failedFiles: string[] = [];
		loader.addEventListener("message", (e) => {
			const output = e.data as ChatLoaderOutput;
			switch(output.type) {
				case "progress":
					onProgress?.(output.progress);
					break;
				case "failed_files":
					failedFiles = output.failedFiles;
					break;
				case "result":
					resolve({chatList: output.chatList, failedFiles});
					break;
			}
		});
	});
}
export async function loadFromFileChooser(onProgress?: (progress: ChatLoadingProgress) => void) {
	return new Promise<FileList | null>((resolve) => {
    const file_chooser = document.createElement("input");
    file_chooser.type = "file";
    file_chooser.accept = "text/plain,.log,.gz";
    file_chooser.multiple = true;
    file_chooser.onchange = () => {
      resolve(file_chooser.files);
    };
		file_chooser.oncancel = () => {
			resolve(null);
		}
    file_chooser.click();
  }).then((fileList) => {
		if(fileList == null) return {chatList: [], failedFiles: []};
		return loadFromFiles([...fileList], onProgress);
	});
}

export function downloadChatAsTxt(chatList: Chat[]) {
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
