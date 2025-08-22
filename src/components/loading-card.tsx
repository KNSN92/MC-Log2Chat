import type { ChatLoadingProgress } from "@/lib/chat-loader.worker";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useEffect, useRef } from "react";

export default function LoadingCard({progress}: {progress: ChatLoadingProgress}) {
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
		<Card className="mx-auto w-[50vw] transition-[width] p-8 gap-2">
			<CardHeader className="px-0">
				<CardTitle>{progress.task === "load_file" ? `Loading file: ${progress.file}` : `Loading chat: ${progress.file}`}<span ref={loadingDotRef} /></CardTitle>
			</CardHeader>
			<div className="flex items-center gap-2">
				<Progress value={progress.progress * 100} />
				{Math.round(progress.progress * 100)}%
			</div>
		</Card>
	)
}