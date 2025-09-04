import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

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

const TARGETS = [
  {
    target: "취준생",
    image: "/recommend_target/job-seeker.png",
    content: "취업 면접을 준비 중이신 분께 추천드려요!",
  },
  {
    target: "면접이 두려운 분",
    image: "/recommend_target/fear-interview.png",
    content: "면접을 위한 자신감이 필요하신 분께 추천드려요!",
  },
  {
    target: "완벽한 면접 준비를 원하시는 분",
    image: "/recommend_target/perfect.png",
    content: "준비가 완벽한지 확인하거나 보완하고 싶으신 분께 추천드려요!",
  },
];

export default function RecommendTargetSection() {
  return (
    <motion.section
      className="w-full min-h-screen bg-background snap-center flex flex-col justify-center items-center px-4 py-16 md:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">이런 분께 추천드려요</h2>
        <p className="text-muted-foreground mt-2"></p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl"
        variants={containerVariants}
      >
        {TARGETS.map((t) => (
          <motion.div key={t.target} variants={cardVariants}>
            <Card className="flex flex-col cursor-pointer hover:scale-105 duration-300 transition-all text-center h-full p-6 bg-white text-black shadow-lg rounded-xl border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{t.target}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center flex-grow">
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={t.image}
                    alt={t.target}
                    layout="fill"
                    objectFit="contain"
                    className="mx-auto"
                  />
                </div>
                <p className="text-muted-foreground mt-auto">{t.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
