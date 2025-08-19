// src/store/media/mediaSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PreferredVideo = {
  width?: number;
  height?: number;
  frameRate?: number;
};

export type MediaState = {
  selectedVideoDeviceId: string | null;
  selectedAudioDeviceId: string | null;
  preferredVideo: PreferredVideo | null;
};

const initialState: MediaState = {
  selectedVideoDeviceId: null,
  selectedAudioDeviceId: null,
  preferredVideo: { width: 1280, height: 720, frameRate: 30 },
};

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    setSelectedVideoDeviceId(state, action: PayloadAction<string | null>) {
      state.selectedVideoDeviceId = action.payload;
    },
    setSelectedAudioDeviceId(state, action: PayloadAction<string | null>) {
      state.selectedAudioDeviceId = action.payload;
    },
    setPreferredVideo(state, action: PayloadAction<PreferredVideo | null>) {
      state.preferredVideo = action.payload;
    },
    resetMediaPrefs(state) {
      state.selectedVideoDeviceId = null;
      state.selectedAudioDeviceId = null;
      state.preferredVideo = { width: 1280, height: 720, frameRate: 30 };
    },
  },
});

export const {
  setSelectedVideoDeviceId,
  setSelectedAudioDeviceId,
  setPreferredVideo,
  resetMediaPrefs,
} = mediaSlice.actions;

export default mediaSlice.reducer;
