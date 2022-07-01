import argon2 from "argon2";

import prisma from '../../utils/prisma'

import { LoginUserInput, RegisterUserInput } from "./user.dto";

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

export async function findUserOrEmail(input: LoginUserInput['emailOrUsername']) {
    return prisma.user.findFirst({
        where: {
            OR: [
                { email: input.toLowerCase() },
                { username: input.toLowerCase() }
            ]
        }
    })
}

export function followingUser({ id, username }: { id: string, username: string }) {
    return prisma.user.update({
        where: {
            id
        },
        data: {
            following: {
                connect: {
                    username
                }
            }
        }
    })
}

export function unFollowingUser({ id, username }: { id: string, username: string }) {
    return prisma.user.update({
        where: {
            id
        },
        data: {
            following: {
                disconnect: {
                    username
                }
            }
        }
    })
}

export function getAllUsers(){
    return prisma.user.findMany()
}

export function findUserFollowing(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            following: true
        }
    })
}

export function findUserFollowers(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            followedBy: true
        }
    })
}

export function findUserById(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId
        }
    })
}