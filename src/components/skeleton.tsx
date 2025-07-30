import { Skeleton } from "./ui/skeleton";
import { TableCell, TableRow } from "./ui/table";

export function ChatViewerSkeleton() {
	return (
		<TableRow>
			<TableCell>
					<Skeleton className="w-full h-5" />
			</TableCell>
			<TableCell>
					<Skeleton className="w-full h-5" />
			</TableCell>
			<TableCell>
					<Skeleton className="w-full h-5" />
			</TableCell>
		</TableRow>
	);
}