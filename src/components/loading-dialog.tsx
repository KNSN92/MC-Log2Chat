import type { ChatLoadingProgress } from "@/lib/chat-loader.worker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { useEffect, useRef } from "react";

export default function LoadingCard({open, progress}: {open: boolean, progress: ChatLoadingProgress}) {
	const loadingDotRef = useRef(null);
	useEffect(() => {
		let i = 0;
		const id = setInterval(() => {
			const loadingDotEle = (loadingDotRef.current as HTMLSpanElement | null);
			if(loadingDotEle) loadingDotEle.innerText = ".".repeat((i++) % 4);
		}, 250);
		return () => {clearInterval(id)};
	}, [])
	return (
		<Dialog open={open}>
			<DialogContent showCloseButton={false}>
				<DialogHeader className="px-0">
					<DialogTitle>
						{
							progress.task == null ? "Loading" : (progress.task === "load_file" ? `Loading file: ${progress.file}` : `Loading chat: ${progress.file}`)
						}<span ref={loadingDotRef} />
					</DialogTitle>
				</DialogHeader>
				<div className="flex items-center gap-2">
					<Progress value={progress.progress * 100} />
					{Math.round(progress.progress * 100)}%
				</div>
			</DialogContent>
		</Dialog>
	)
}