"use client";

type PanelProps = React.PropsWithChildren<{
  tone?: "subtle" | "solid";
}>;

export default function InterviewPanel({ tone = "subtle", children }: PanelProps) {
  return (
    <section
      className={[
        "rounded-2xl border p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4",
        tone === "subtle" ? "bg-secondary/40" : "bg-white"
      ].join(" ")}
    >
      {children}
    </section>
  );
}
