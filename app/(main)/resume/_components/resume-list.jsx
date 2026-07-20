"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Edit3, Trash2, Download, Eye, PlusCircle, CheckCircle2, Sparkles } from "lucide-react";
import { deleteResume } from "@/actions/resume";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ResumeList({ resume, onSelectEdit }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResume();
      toast.success("Resume deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!resume) {
    return (
      <Card className="border-2 border-dashed p-8 text-center space-y-4 bg-muted/20">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <FileText className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-bold text-lg">No Saved Resume Found</h3>
          <p className="text-xs text-muted-foreground">
            You haven't saved a resume yet. Use the Resume Builder to draft and save your tailored ATS resume.
          </p>
        </div>
        <Button onClick={onSelectEdit}>
          <PlusCircle className="h-4 w-4 mr-2" /> Start Building Resume
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Your Saved Master Resume</h2>
          <p className="text-xs text-muted-foreground">Access, update, or export your saved ATS resume anytime.</p>
        </div>
        <Button onClick={onSelectEdit} variant="outline" className="gap-2">
          <Edit3 className="h-4 w-4 text-primary" /> Open Builder Editor
        </Button>
      </div>

      <Card className="border-2 hover:border-primary/40 transition-all shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Master ATS Resume
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" /> Updated on{" "}
              {resume.updatedAt ? format(new Date(resume.updatedAt), "PPP") : "Recently"}
            </CardDescription>
          </div>
          <span className="bg-green-500/10 text-green-600 dark:text-green-400 font-semibold px-2.5 py-1 rounded-full text-xs flex items-center gap-1 border border-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved & Active
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted/40 rounded-lg text-xs font-mono line-clamp-3 text-muted-foreground whitespace-pre-wrap">
            {resume.content || "Empty content..."}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t bg-muted/20 pt-3">
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={onSelectEdit} className="gap-1.5">
              <Edit3 className="h-4 w-4" /> Edit Resume
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your saved resume.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? "Deleting..." : "Delete Resume"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
