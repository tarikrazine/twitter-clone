import { CreateMessageInput } from "./message.dto";
import prisma from "../../utils/prisma";

export function createMessage({input, userId}: {input: CreateMessageInput, userId: string}) {
    return prisma.message.create({
        data: {
            text: input.text,
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
}

export function getAllMessages() {
    return prisma.message.findMany();
}