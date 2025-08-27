import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/storeHook";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import GeneralAlertDialog from "../dialog/GeneralAlertDialog";

// 애니메이션 Variants 정의
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // 자식 요소들이 0.3초 간격으로 나타남
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 }, // 아래에서 50px 떨어진 위치에서 시작
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function HeroSection() {
  const router = useRouter();

  // 로그인 상태 store
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  return (
    <motion.section
      className="snap-start w-full min-h-screen flex flex-col justify-center items-center text-center px-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold tracking-tight"
        variants={itemVariants}
      >
        실전처럼 완벽하게,
        <br />
        <span className="text-primary text-5xl md:text-6xl">AI</span>와 함께하는
        면접 준비
      </motion.h1>
      <motion.p
        className="mt-4 text-lg text-muted-foreground"
        variants={itemVariants}
      >
        AI 면접관과 함께 언제 어디서든 실전 감각을 키워보세요.
      </motion.p>
      <motion.div variants={itemVariants}>
        {/** 알림창 트리거 */}
        <AlertDialogTrigger asChild>
          <Button
            size="lg"
            onClick={() => {
              if (isLoggedIn) {
                router.push("/ready");
              } else {
                // <GeneralAlertDialog props={{ title: "", description: "" }} />;
              }
            }}
            className="mt-10 cursor-pointer text-xl font-bold px-10 py-6 transition-transform transform hover:border-ring"
          >
            AI 면접 시작하기
          </Button>
        </AlertDialogTrigger>
      </motion.div>
    </motion.section>
  );
}
