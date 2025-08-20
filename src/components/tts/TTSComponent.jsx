import React, { useState, useEffect } from "react";

const SpeechComponent = ({ text }) => {
  const [utterance, setUtterance] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    setUtterance(u);

    const handleVoicesChanged = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      // 기본 목소리 설정 (예: 한국어)
      const koreanVoice = availableVoices.find(
        (voice) => voice.lang === "ko-KR",
      );
      if (koreanVoice) {
        setSelectedVoice(koreanVoice);
      }
    };

    synth.addEventListener("voiceschanged", handleVoicesChanged);
    handleVoicesChanged(); // 초기 로드 시 목소리 목록 가져오기

    return () => {
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      synth.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;
    if (utterance) {
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      synth.speak(utterance);
    }
  };

  return (
    <div>
      <span>{text}</span>
      <button className="rounded-xl w-full h-10 bg-green-300 text-white hover:bg-green-400 cursor-pointer my-5" onClick={handlePlay}>재생</button>
    </div>
  );
};

export default SpeechComponent;
