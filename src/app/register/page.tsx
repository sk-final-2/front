// import RegisterForm from "@/components/register/RegisterForm";

import RegisterForm from "@/components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        {/** 회원가입 폼 */}
        <RegisterForm />
      </div>
    </div>
  );
}
