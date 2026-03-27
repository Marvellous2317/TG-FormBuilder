
import { Expo } from "expo-server-sdk";
import { User } from "../models/model.js";
import { Op } from "sequelize";

const expo = new Expo();



import { Pool } from "pg";

// Expo SDK



export const sendPushNotification = async (pushNotificationToken, title, body, data = {}) => {
  try {
    if (!pushNotificationToken || !Expo.isExpoPushToken(pushNotificationToken)) {
      console.warn("Invalid push token", pushNotificationToken);
      return false;
    }

    const messages = [{
      to: pushNotificationToken,
      sound: "default",
      title,
      body,
      data,
    }];

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    return true;
  } catch (err) {
    console.error("Notification send error:", err);
    return false;
  }
};











export async function sendExpoNotificationTesting() {
  try {
    const users = await User.findAll({
      where: {
        pushNotificationToken: {
          [Op.ne]: null,
        },
      },
      attributes: ["userId", "pushNotificationToken"],
    });

    if (!users || users.length === 0) {
      console.log("No users with Expo push tokens");
      return;
    }

    const messages = [];


    for (const user of users) {
      const token = user.pushNotificationToken;

      if (!Expo.isExpoPushToken(token)) {
        console.warn(`Invalid Expo token for user ${user.userId}`);
        continue;
      }

      messages.push({
        to: token,
        sound: "default",
        title: "Test Notification",
        body: "testing expo push notification",
        data: { userId: user.userId },
      });
    }

    if (messages.length === 0) {
      console.log("No valid Expo tokens found");
      return;
    }


    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log("Receipts:", receipts);
      } catch (error) {
        console.error("Error sending chunk:", error);
      }
    }

    console.log("Expo notifications sent successfully");
  } catch (error) {
    console.error("Failed to send Expo notifications:", error);
  }
}
