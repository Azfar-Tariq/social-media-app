"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Post } from "@/components/Post";
import { PostType } from "@/types/post";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaUpload } from "@/components/MediaUpload";

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status]);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !mediaFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setNewPost("");
        setMediaFile(null);
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-onBackground">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2"
          >
            Welcome to Chirpify
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-muted-foreground mb-8"
          >
            Connect with friends and share your moments
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <Link href="/login">
              <Button className="w-full bg-primary text-onPrimary hover:bg-primary/90">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in to continue
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={session.user?.image || ""}
              alt={session.user?.name || ""}
            />
            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-onBackground">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-muted-foreground">What&apos;s on your mind?</p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl shadow-lg border border-border/50 p-6 mb-8"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 rounded-lg border border-border/50 bg-background text-onBackground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={3}
          />
          <div className="mt-4">
            <MediaUpload
              onMediaSelected={(file) => setMediaFile(file)}
              onRemove={() => setMediaFile(null)}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              disabled={isUploading || (!newPost.trim() && !mediaFile)}
              className="bg-primary text-onPrimary hover:bg-primary/90"
            >
              {isUploading ? "Posting..." : "Post"}
            </Button>
          </div>
        </motion.form>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Post post={post} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
