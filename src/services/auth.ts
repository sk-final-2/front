import axios from "axios";

export async function login(email: string, password: string) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    { email, password },
  );
  return res.data;
}

export async function kakaoSignup(payload: {
  email: string;
  name: string;
  gender: "MALE" | "FEMALE";
  birth: string;
  zipcode: string;
  address1: string;
  address2: string;
}) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao-signup`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );
  return res.data; // { status, code, message, data }
}

export async function googleSignup(payload: {
  email: string;
  name: string;
  gender: "MALE" | "FEMALE";
  birth: string;
  zipcode: string;
  address1: string;
  address2: string;
}) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-signup`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );
  return res.data; // { status, code, message, data }
}
