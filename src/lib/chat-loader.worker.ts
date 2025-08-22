import { get_chat, type Chat } from "./chat";

export type ChatLoaderInput = {
	type: "file",
	files: File[]
} | {
	type: "text",
	text: string
}

export type ChatLoadingProgress = {
	task: "load_file" | "get_chat",
	file: string | null,
	progress: number,
}

export type ChatLoaderOutput = {
	type: "progress",
	progress: ChatLoadingProgress
} | {
	type: "failed_files",
	failedFiles: string[],
} | {
	type: "result",
	chatList: Chat[],
}

type ChatSection = {
    name: string | null;
    date: {
        year: number;
        month: number;
        day: number;
    } | null;
    lines: string[];
};

addEventListener("message", async e => {
	const data = e.data as ChatLoaderInput;
	let chatSections: ChatSection[] | null = data.type === "text" ? [{
		name: null,
		date: null,
		lines: data.text.split("\n")
	}] : null;
	if(data.type === "file") {
		const {sections, failedFiles} = await loadChatFiles(data.files, (file, progress) => {
			postMessage({
				type: "progress",
				task: "load_file",
				file,
				progress
			})
		});
		if(failedFiles.length > 0) {
			postMessage({
				type: "failed_files",
				failedFiles
			});
		}
		chatSections = sections;
	}
	if(!chatSections) {
		postMessage({
			type: "result",
			chatList: []
		});
		return;
	}
	const totalLines = chatSections.reduce((acc, section) => acc + section.lines.length, 0);
	const lineLenAcc = chatSections.reduce((acc, section) => {
		acc.push(acc[acc.length-1] + section.lines.length);
		return acc;
	}, [0]);
	lineLenAcc.pop();
	const chatList: Chat[] = chatSections.map((chatSection, section_idx) => 
		chatSection.lines.map((line, i) => {
			const chat = get_chat(line);
			postMessage({
				type: "progress",
				progress: {
					task: "get_chat",
					file: chatSection.name,
					progress: (lineLenAcc[section_idx] + i) / totalLines,
				}
			} satisfies ChatLoaderOutput);
			if(!chat) return null;
			if(chatSection.date) {
				chat.time.year = chatSection.date.year;
				chat.time.month = chatSection.date.month;
				chat.time.day = chatSection.date.day;
			}
			return chat;
		}).filter((chat) => chat !== null)
	).reduce((acc, chatList) => {
		return [...acc, ...chatList];
	}, []);
	postMessage({
		type: "result",
		chatList
	})
});

export async function loadChatFiles(files: File[], onFileLoad?: (file: string, progress: number) => void): Promise<{
	sections: ChatSection[],
	failedFiles: string[],
}> {
	const failedFiles: string[] = [];

	files = files.filter((file) => {
		const acceptable = file.type === "text/plain" || file.name.endsWith(".log") || file.name.endsWith(".log.gz");
		if(!acceptable) failedFiles.push(file.name);
		return acceptable;
	});

	const readedFiles = await Promise.all(
		files.map(async (file, i) => {
			if(onFileLoad) onFileLoad(file.name, (i + 1) / files.length);
			return {
				name: file.name,
				date: getDateFromFilename(file.name),
				lines: (await (
					file.name.endsWith(".gz") ? await gzipDecompless(file) : file
				).text()).split("\n"),
			};
		})
	);

	return {
		sections: readedFiles,
		failedFiles,
	}
}

function getDateFromFilename(filename: string) {
	const filename_match = filename.match(
		/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
	);
	const date = filename_match?.groups
		? {
				year: parseInt(filename_match.groups.year),
				month: parseInt(filename_match.groups.month),
				day: parseInt(filename_match.groups.day),
			}
		: null;
	return date;
}

export default async function gzipDecompless(compressed: Blob) {
	const decompressor = new DecompressionStream("gzip");
	const decompressedStream = compressed.stream().pipeThrough(decompressor);
	const decompressedResponse = new Response(decompressedStream);
	return await decompressedResponse.blob();
}