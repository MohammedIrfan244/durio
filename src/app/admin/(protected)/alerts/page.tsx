"use client";

import React, { useEffect, useState } from "react";
import {
  getAppAlerts,
  createAppAlert,
  toggleAppAlert,
  deleteAppAlert,
} from "@/server/actions/app-alert-actions";
import { toast } from "sonner";
import type { AppAlert } from "@prisma/client";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [changelogRaw, setChangelogRaw] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("/downloads/durio.apk");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    const res = await getAppAlerts();
    if (res.success) {
      setAlerts(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !version || !description) {
      toast.error("Please fill all required fields.");
      return;
    }

    const changelog = changelogRaw
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setIsSubmitting(true);

    const res = await createAppAlert({
      title,
      version,
      description,
      changelog,
      downloadUrl: downloadUrl || "/downloads/durio.apk",
      isActive,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("App alert created successfully.");
      setTitle("");
      setVersion("");
      setDescription("");
      setChangelogRaw("");
      setDownloadUrl("/downloads/durio.apk");
      setIsActive(true);
      fetchAlerts();
    } else {
      toast.error(
        typeof res.error === "string" ? res.error : "Failed to create alert"
      );
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleAppAlert(id, !currentStatus);
    if (res.success) {
      toast.success("Alert status updated");
      fetchAlerts();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      const res = await deleteAppAlert(id);
      if (res.success) {
        toast.success("Alert deleted");
        fetchAlerts();
      } else {
        toast.error("Failed to delete alert");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">In-App Update Alerts</h2>
        <p className="text-zinc-400 text-sm">
          Manage announcements and update modals shown to mobile users when opening the app.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Create New Update Alert</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Durio Version 1.1 Available"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Version *
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 1.1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the update..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Changelog (one item per line)
            </label>
            <textarea
              value={changelogRaw}
              onChange={(e) => setChangelogRaw(e.target.value)}
              placeholder="3-day cycle warning for menstruation&#10;Overdue task column and real-time alerts&#10;Bug fixes and push notification improvements"
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Download URL
              </label>
              <input
                type="text"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="/downloads/durio.apk"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-blue-600 focus:ring-0"
              />
              <label htmlFor="isActiveCheck" className="text-sm text-zinc-300">
                Activate immediately (deactivates previous alerts)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-white text-black font-semibold rounded text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Create Alert"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Existing Alerts</h3>
        {loading ? (
          <p className="text-zinc-500 text-sm">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No alerts configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-bold text-base">{item.title}</h4>
                    <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                      v{item.version}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded font-medium ${
                        item.isActive
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{item.description}</p>
                  {item.changelog && item.changelog.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1 pl-1">
                      {item.changelog.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-xs text-zinc-500 pt-1">
                    Download: <span className="font-mono text-zinc-400">{item.downloadUrl}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleToggle(item.id, item.isActive)}
                    className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                      item.isActive
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {item.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-xs rounded font-medium bg-red-950/60 text-red-400 hover:bg-red-900/80 border border-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
