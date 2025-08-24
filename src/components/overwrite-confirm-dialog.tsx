import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

export default function OverwriteConfirmDialog({ open, setOpen, onClickOk }: { open: boolean, setOpen: (open: boolean) => void, onClickOk: () => void }) {
	return (
		<Dialog open={open}>
			<DialogContent showCloseButton={false}>{/*className="mx-auto w-[50vw] transition-[width] p-8 gap-2">*/}
				<DialogHeader>
					<DialogTitle>Confirm to overwrite</DialogTitle>
					<DialogDescription>Pressing the “Ok” button will clear the currently loaded chat list.</DialogDescription>
				</DialogHeader>
				<div className="w-full flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant={"outline"} onClick={() => setOpen(false)}>Cancel</Button>
					</DialogClose>
					<Button variant={"destructive"} onClick={() => {setOpen(false);onClickOk();}}>Ok</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}