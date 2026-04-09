// server/src/services/auth.service.ts
// All business logic for user registration and login. DB calls live here — not in controllers.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
const SALT_ROUNDS = 12;
const USER_PUBLIC_SELECT = {
    id: true, username: true, email: true, reputationScore: true, createdAt: true,
};
export const register = async (data) => {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await (async () => {
        try {
            return (await prisma.user.create({
                data: { username: data.username, email: data.email, passwordHash },
                select: USER_PUBLIC_SELECT,
            }));
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002') {
                throw new AppError('Email or username already in use', 409);
            }
            throw err;
        }
    })();
    const token = signToken(user.id, user.email, user.username);
    return { token, user };
};
export const login = async (data) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: { ...USER_PUBLIC_SELECT, passwordHash: true },
    });
    if (user === null) {
        throw new AppError('Invalid credentials', 401);
    }
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
        throw new AppError('Invalid credentials', 401);
    }
    const token = signToken(user.id, user.email, user.username);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _omit, ...publicUser } = user;
    return { token, user: publicUser };
};
export const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: USER_PUBLIC_SELECT,
    });
    if (user === null)
        throw new AppError('User not found', 404);
    return user;
};
const signToken = (id, email, username) => jwt.sign({ id, email, username }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
});
//# sourceMappingURL=auth.service.js.map