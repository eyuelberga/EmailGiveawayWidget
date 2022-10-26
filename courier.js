import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { CourierClient } from "@trycourier/courier";
dotenv.config();
const courier = CourierClient({ authorizationToken: process.env.COURIER_KEY });

export const addToList = async ({ name, email }, listId) => {
    const recipientId = uuidv4();
    await courier.mergeProfile({
        recipientId,
        profile: {
            email,
            name
        }
    });
    await courier.lists.subscribe(listId, recipientId);
    return recipientId;
}


export const sendMessage = async (recipientId, notificationTemplate, data) => {
    await courier.send({
        message: {
            to: {
                user_id: recipientId
            },
            routing: {
                method: "single",
                channels: ["email"]
            },
            template: notificationTemplate,
            data
        },
    });
    return true;
}

export const sendGiveaway = async (listId, notificationTemplate, { name, email }) => {
    const recipientId = await addToList({ name, email }, listId);
    await sendMessage(recipientId, notificationTemplate, { name, email });
}
export default courier;