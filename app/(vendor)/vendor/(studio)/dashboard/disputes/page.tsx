import { DisputesContent } from "./_components/disputes-content";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl leading-none tracking-tight text-foreground">Disputes</h1>
        <p className="text-lg leading-none text-muted-foreground">
          Review buyer complaints and respond in the thread.
        </p>
      </div>
      <DisputesContent />
    </div>
  );
}
