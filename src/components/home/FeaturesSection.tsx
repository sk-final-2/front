import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

const FEATURES = [
  {
    title: "실시간 피드백",
    image: "/features/feedback.png",
    content: "답변 내용, 목소리 톤, 시선 처리 등 종합적인 분석 및 피드백 제공",
  },
  {
    title: "맞춤형 질문",
    image: "/features/tailored-questions.png",
    content: "지원하는 직무와 산업에 맞춘 예상 질문 생성",
  },
  {
    title: "다양한 면접 유형",
    image: "/features/various-interview.png",
    content: "기술 면접, 인성 면접, 종합 면접 등 다양한 시나리오 제공",
  },
  {
    title: "결과 분석 리포트",
    image: "/features/results-analysis.png",
    content: "강점과 약점을 시각적으로 보여주는 상세 리포트",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 카드들이 0.2초 간격으로 나타남
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturesSection() {
  return (
    <motion.section
      className="w-full min-h-screen bg-background snap-center flex flex-col justify-center items-center px-4 py-16 md:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
          AI가 제공하는 개인 맞춤형 면접 코칭
        </h2>
        <p className="text-muted-foreground mt-2">
          당신의 합격까지 함께합니다.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl"
        variants={containerVariants}
      >
        {FEATURES.map((feature) => (
          <motion.div key={feature.title} variants={cardVariants}>
            <Card className="flex flex-col cursor-pointer hover:scale-105 transition text-center h-full p-6 bg-white text-black border-border shadow-lg rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center flex-grow">
                <div className="relative w-full h-40 mb-4">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    style={{ objectFit: "contain" }}
                    className="mx-auto"
                  />
                </div>
                <p className="text-muted-foreground mt-auto">
                  {feature.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
