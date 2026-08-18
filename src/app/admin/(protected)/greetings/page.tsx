"use client";

import React, { useEffect, useState } from "react";
import {
  getGreetings,
  createGreeting,
  toggleGreeting,
  deleteGreeting,
} from "@/server/actions/greeting-actions";
import { toast } from "sonner";
import Image from "next/image";
import type { GreetingCard } from "@prisma/client";

export default function AdminGreetingsPage() {
  const [greetings, setGreetings] = useState<GreetingCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [titleColor, setTitleColor] = useState("");
  const [descColor, setDescColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [giftBoxColor, setGiftBoxColor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGreetings = async () => {
    setLoading(true);
    const res = await getGreetings();
    if (res.success) {
      setGreetings(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGreetings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !file) {
      toast.error("Please fill all required fields and select an image.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    if (titleColor) formData.append("titleColor", titleColor);
    if (descColor) formData.append("descColor", descColor);
    if (bgColor) formData.append("bgColor", bgColor);
    if (giftBoxColor) formData.append("giftBoxColor", giftBoxColor);

    const res = await createGreeting(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Greeting created and activated!");
      setTitle("");
      setDescription("");
      setFile(null);
      setTitleColor("");
      setDescColor("");
      setBgColor("");
      setGiftBoxColor("");
      fetchGreetings();
    } else {
      toast.error(
        typeof res.error === "string" ? res.error : "Failed to create greeting",
      );
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await toggleGreeting(id, !isActive);
    if (res.success) {
      toast.success("Greeting status updated");
      fetchGreetings();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this greeting?")) {
      const res = await deleteGreeting(id);
      if (res.success) {
        toast.success("Greeting deleted");
        fetchGreetings();
      } else {
        toast.error("Failed to delete greeting");
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">Greeting Cards</h2>
        <p className="text-zinc-400">
          Manage the greeting card section that users see on their dashboard.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Create New Greeting</h3>
        <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">
                Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white min-h-[80px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium text-zinc-300">
                Title Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={titleColor || "#ffffff"}
                  onChange={(e) => setTitleColor(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded p-0.5 h-9 w-12"
                />
                <button
                  type="button"
                  onClick={() => setTitleColor("")}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium text-zinc-300">
                Desc Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={descColor || "#a1a1aa"}
                  onChange={(e) => setDescColor(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded p-0.5 h-9 w-12"
                />
                <button
                  type="button"
                  onClick={() => setDescColor("")}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium text-zinc-300">
                Background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor || "#18181b"}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded p-0.5 h-9 w-12"
                />
                <button
                  type="button"
                  onClick={() => setBgColor("")}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-sm font-medium text-zinc-300">
                Gift Box Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={giftBoxColor || "#f43f5e"}
                  onChange={(e) => setGiftBoxColor(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded p-0.5 h-9 w-12"
                />
                <button
                  type="button"
                  onClick={() => setGiftBoxColor("")}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Leaving colors cleared will use the user&apos;s active theme colors.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-white text-black text-sm font-bold rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Create & Activate Greeting"}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Existing Greetings</h3>

        {loading ? (
          <div className="text-zinc-500 text-sm">Loading...</div>
        ) : greetings.length === 0 ? (
          <div className="text-zinc-500 text-sm">No greetings found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {greetings.map((g) => (
              <div
                key={g.id}
                className={`border rounded-lg overflow-hidden flex flex-col ${
                  g.isActive ? "border-green-500/50" : "border-zinc-800"
                }`}
              >
                <div className="relative h-40 w-full bg-zinc-950">
                  <Image
                    src={g.imageUrl}
                    alt={g.title}
                    width={400}
                    height={400}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white truncate">{g.title}</h4>
                    {g.isActive && (
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 flex-1">
                    {g.description}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(g.id, g.isActive)}
                      className={`text-xs px-3 py-1.5 rounded font-medium flex-1 ${
                        g.isActive
                          ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      }`}
                    >
                      {g.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-xs px-3 py-1.5 rounded font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
