"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Post } from "@/components/Post";
import { PostType } from "@/types/post";

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState("");

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
    if (!newPost.trim()) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost }),
    });

    if (res.ok) {
      setNewPost("");
      fetchPosts();
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-onBackground">
        <h1 className="text-5xl font-bold mb-4">Welcome to SocialApp</h1>
        <p className="text-xl mb-8">
          Connect with friends and share your moments
        </p>
        <div className="space-x-4">
          <Link href="/login">
            <Button className="bg-primary text-onPrimary hover:bg-primary/80">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-surface text-onSurface border border-primary hover:bg-surface/80">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 text-onBackground">
      <h1 className="text-3xl font-bold mb-5">
        Welcome, {session.user?.name}!
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded bg-surface text-onSurface"
          rows={3}
        />
        <Button
          type="submit"
          className="mt-2 bg-primary text-onPrimary hover:bg-primary/80"
        >
          Post
        </Button>
      </form>

      <div>
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
