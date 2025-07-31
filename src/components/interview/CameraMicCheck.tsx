"use client"

import React from 'react';

const CameraMicCheck = () => {
  return (
    <div className="w-full max-w-md p-8 space-y-4 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">카메라 & 마이크 확인</h2>
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-md">
        <p className="text-gray-600">카메라와 마이크 접근 권한을 허용해주세요.</p>
        <button className="mt-4 px-4 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">
          권한 확인하기
        </button>
      </div>
    </div>
  );
};

export default CameraMicCheck;