import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center overflow-auto">
      <span className="title pt-20">회원가입</span>

      {/** 회원가입 폼 */}
      <RegisterForm />
      <div className="mt-20"></div>
    </div>
  );
}
