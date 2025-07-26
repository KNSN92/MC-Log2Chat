import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { File } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function FileDragDrop({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="w-fit p-20 flex flex-col justify-center items-center"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Drag&Drop Here!</DialogTitle>
          <DialogDescription>
            <File className="size-40 opacity-50" />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
