import bcrypt from 'bcrypt';

const comparePasswords = async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(enteredPassword, hashedPassword);
};

const status = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    EXPIRED: "EXPIRED"
}

export { comparePasswords, status }
