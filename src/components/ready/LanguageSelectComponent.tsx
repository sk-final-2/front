import { LanguageType } from "@/app/ready/page";
import { FlagComponent, KR, US } from "country-flag-icons/react/3x2";

type LanguageSelectComponentProps = {
  language: LanguageType;
  handleLanguageChange: (language: LanguageType) => void;
};

const languageList: LanguageType[] = ["KOREAN", "ENGLISH"];

const languageIconMap: Record<LanguageType, FlagComponent> = {
  KOREAN: KR,
  ENGLISH: US,
};

const LanguageSelectComponent = ({
  language,
  handleLanguageChange,
}: LanguageSelectComponentProps) => {
  return (
    <div className="w-full flex flex-row gap-5">
      {languageList.map((lang) => {
        const Flag = languageIconMap[lang];

        return (
          <div
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`flex-1 flex text-md font-bold flex-col justify-center items-center cursor-pointer rounded-lg border-[1px] border-gray-400 transition hover:scale-105 duration-300 ${
                language === lang ? "bg-gray-200 border-gray-700 border-[2px]" : ""
            }`}
          >
            <Flag title={lang} width={100} height={100} />
            <span className="mb-4">{lang === "KOREAN" ? "한국어" : lang}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LanguageSelectComponent;
