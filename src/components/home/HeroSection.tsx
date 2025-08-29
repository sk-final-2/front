import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/storeHook";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

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

  // 면접 바로가기 버튼 액션
  const handleButtonClick = () => {
    if (isLoggedIn) {
      router.push("/ready");
    }
  };

  return (
    <motion.section
      className="relative overflow-hidden snap-start w-full min-h-screen flex flex-col justify-center items-center text-center px-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* 백그라운드 이미지 배경 */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Image
          src="/main_view.png"
          alt="메인 배경"
          fill
          priority
          className="w-full h-full object-cover opacity-40"
          style={{
            maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
          variants={itemVariants}
        >
          실전처럼 완벽하게,
          <br />
          <span className="text-primary text-5xl md:text-6xl">AI</span>와
          함께하는 면접 준비
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-muted-foreground"
          variants={itemVariants}
        >
          AI 면접관과 함께 언제 어디서든 실전 감각을 키워보세요.
        </motion.p>
        <motion.div variants={itemVariants}>
          <AlertDialog>
            {/** 알림창 트리거 */}
            <AlertDialogTrigger asChild>
              <Button
                size="lg"
                onClick={handleButtonClick}
                className="mt-10 cursor-pointer text-xl text-white font-bold px-10 py-6 transform hover:border-ring 
                      rounded-full
                      border-0
                      bg-primary
                      shadow-[0_0_8px_rgba(0,0,0,0.05)]
                      tracking-[1.5px]
                      transition-all
                      duration-500
                      ease-in-out
                      hover:tracking-[3px]
                      hover:bg-[hsl(240,80%,48%)]
                      hover:text-white
                      hover:shadow-[0px_7px_29px_0px_#1818dc]
                      active:shadow-none
                      active:duration-100"
              >
                AI 면접 시작하기
              </Button>
            </AlertDialogTrigger>
            {!isLoggedIn && (
              <AlertDialogContent className="border-none bg-background">
                <AlertDialogHeader>
                  <AlertDialogTitle>로그인이 필요합니다.</AlertDialogTitle>
                  <AlertDialogDescription>
                    로그인 페이지로 이동하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    취소
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => router.push("/login")}
                    className="cursor-pointer"
                  >
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
        </motion.div>
      </div>
    </motion.section>
  );
}
