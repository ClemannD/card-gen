'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ModeToggle } from '@/components/mode-toggle';

export default function NotesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const utils = api.useUtils();

  // Queries
  // Note: Authentication is handled by middleware, so we can safely query without enabled check
  const { data: notes, isLoading } = api.notes.list.useQuery();

  // Mutations
  const createNote = api.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setTitle('');
      setContent('');
    },
  });

  const updateNote = api.notes.update.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setEditingId(null);
      setTitle('');
      setContent('');
    },
  });

  const deleteNote = api.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setDeleteDialogOpen(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateNote.mutate({ id: editingId, title, content });
    } else {
      createNote.mutate({ title, content });
    }
  };

  const handleEdit = (note: { id: string; title: string; content: string }) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handleDelete = (id: string) => {
    deleteNote.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">
                {session?.user?.name || session?.user?.email}
              </span>
              <ModeToggle />
              <Button onClick={handleSignOut} variant="outline">
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Create/Edit Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Note' : 'Create New Note'}</CardTitle>
            <CardDescription>
              {editingId
                ? 'Update your note below'
                : 'Add a new note to your collection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter note title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  placeholder="Enter note content"
                />
              </div>
              <CardFooter className="flex gap-2 px-0 pb-0">
                <Button
                  type="submit"
                  disabled={createNote.isPending || updateNote.isPending}
                >
                  {editingId ? 'Update Note' : 'Create Note'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        {/* Notes List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Notes</h2>
          {notes && notes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No notes yet. Create your first note above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes?.map((note) => (
                <Card key={note.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(note)}
                      variant="outline"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <AlertDialog
                      open={deleteDialogOpen === note.id}
                      onOpenChange={(open) =>
                        setDeleteDialogOpen(open ? note.id : null)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={deleteNote.isPending}
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the note &quot;{note.title}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(note.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
