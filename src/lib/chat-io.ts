import { get_chat, type Chat } from "./chat";

export async function load_from_files(files: File[]) {
	let chatList: Chat[] = [];
	await Promise.all(
		files
			.filter((file) => file.type === "text/plain" || file.name.endsWith(".log"))
			.map(async (file) => {
				const filename_match = file.name.match(
					/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
				);
				const date = filename_match?.groups
					? {
							year: parseInt(filename_match.groups.year),
							month: parseInt(filename_match.groups.month),
							day: parseInt(filename_match.groups.day),
						}
					: null;
				const text = await file.text();
				const fileChatList = text
					.split("\n")
					.map((line) => get_chat(line))
					.filter((chat) => chat !== null)
					.map((chat) =>
						date
							? { ...chat, time: { ...chat?.time, ...date } }
							: chat
					);
				chatList = [...chatList, ...fileChatList];
			})
	);
	return chatList;
}
