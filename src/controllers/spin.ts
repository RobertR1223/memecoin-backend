import { Request, Response } from "express";
import { databaseDetails } from "../config/db.config";
import { db } from "..";

// Define the segments of the wheel
const segments = [777, 7, 7777, 77, 777, 7, 777, 7, 7777, 77, 77777, 7];
// Define the probabilities for each segment
const probabilities: { [key: number]: number } = {
  7: 0.75,
  77: 0.2,
  777: 0.04,
  7777: 0.009,
  77777: 0.001,
};

// Function to spin the wheel
const spinWheel = async (
  ipAddress: string,
  walletAddress: string
): Promise<number> => {
  const weightedSegments: number[] = [];
  segments.forEach((segment) => {
    const count = Math.floor(probabilities[segment] * 1000); // Multiply by 1000 for precision
    for (let i = 0; i < count; i++) {
      weightedSegments.push(segment);
    }
  });

  // Generate a random index based on the segments array length
  const randomIndex = Math.floor(Math.random() * weightedSegments.length);
  const prize = weightedSegments[randomIndex];

  // Record the spin time
  const query = `
    INSERT INTO ${databaseDetails.SCHEMA_NAME}.${databaseDetails.SPIN_HISTORY} (ip_address, wallet_address, prize, last_spin)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `;
  await db.query(query, [ipAddress, walletAddress, prize]);

  return prize;
};

const canSpinWheel = async (
  ipAddress: string,
  walletAddress: string
): Promise<boolean> => {
  const query = `
  SELECT last_spin FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.SPIN_HISTORY}
  WHERE ip_address = ? OR wallet_address = ?
  ORDER BY last_spin DESC
  LIMIT 1
`;
  const [rows] = await db.query(query, [ipAddress, walletAddress]);

  if (rows.length === 0) {
    return true;
  } else {
    const lastSpin =
      rows && rows.length > 0 ? new Date(rows[0].LAST_SPIN).getTime() : 0;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return now - lastSpin > oneDay;
  }
};

export const callSpinWheel = async (req: Request, res: Response) => {
  try {
    const ipAddress = req.query.ipAddress as string;
    const walletAddress = req.query.wallet as string;

    if (!walletAddress || !ipAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    if (!(await canSpinWheel(ipAddress, walletAddress))) {
      return res
        .status(403)
        .json({ error: "You can only spin once every 24 hours" });
    }

    const result = await spinWheel(ipAddress, walletAddress);
    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
  }
};

export const getLastTime = async (req: Request, res: Response) => {
  try {
    const walletAddress = req.query.wallet as string;
    const ipAddress = req.query.ipAddress as string;

    if (!walletAddress || !ipAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const query = `
      SELECT last_spin FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.SPIN_HISTORY}
      WHERE ip_address = ? OR wallet_address = ?
      ORDER BY last_spin DESC
      LIMIT 1
    `;
    const [rows] = await db.query(query, [ipAddress, walletAddress]);

    const lastSpin =
      rows && rows.length > 0 ? new Date(rows[0].LAST_SPIN).getTime() : 0;
    res.status(200).json({ data: lastSpin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTotalPoints = async (req: Request, res: Response) => {
  try {
    const walletAddress = req.query.wallet as string;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const query = `
      SELECT SUM(prize) as total_points FROM ${databaseDetails.SCHEMA_NAME}.${databaseDetails.SPIN_HISTORY}
      WHERE wallet_address = ?
    `;
    const [resp] = await db.query(query, [walletAddress]);
    const totalPoints = resp[0].TOTAL_POINTS;
    res.status(200).json({ data: totalPoints });
  } catch (err) {
    console.error(err);
  }
};
