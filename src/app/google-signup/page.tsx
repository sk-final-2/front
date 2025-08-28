import GoogleForm from "@/components/login/google/GoogleForm";

export default function GooglePage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <GoogleForm />
      </div>
    </div>
  );
}
