import { NextApiRequest, NextApiResponse } from "next";
import { decryptData } from "@/utils/encryption";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "Missing data in request body" });
  }

  try {
    const decryptedData = decryptData(data);
    return res.status(200).json({ decryptedData });
  } catch (error) {
    return res.status(500).json({ error: "Failed to decrypt data" });
  }
};

export default handler;
