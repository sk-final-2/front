import axios from "axios";

export default async function sendDocument(file: File): Promise<string> {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/video/upload-and-forward`,
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    },
  );

  return res.data;
}
