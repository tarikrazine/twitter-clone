import argon2 from "argon2";

import prisma from '../../utils/prisma'

import { RegisterUserInput } from "./user.dto";

export async function registerUser(input: RegisterUserInput) {
    const hashPassword = await argon2.hash(input.password)

    const user = await prisma.user.create({
        data: {
            ...input,
            username: input.username.toLowerCase(),
            email: input.email.toLowerCase(),
            password: hashPassword
        }
    })

    return user
}