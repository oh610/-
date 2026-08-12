"use client";

import { useState, type FormEvent } from "react";

export default function ContactPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "문의 전송에 실패했습니다.");
      return;
    }

    setSent(true);
    setTitle("");
    setContent("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-sm">
        <h1 className="mb-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">문의</h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          남겨주신 내용은 운영자 이메일로 바로 전달됩니다.
        </p>

        {sent ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            문의가 전송되었습니다. 확인 후 답변드릴게요.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              required
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <textarea
              required
              rows={6}
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "전송 중..." : "문의 보내기"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
