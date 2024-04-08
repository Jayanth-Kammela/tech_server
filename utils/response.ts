import { ErrorResponse, SuccessResponse } from "types/types";

const success = (statusCode: number, message: string, result: any): SuccessResponse => {
    return {
        status: true,
        statusCode,
        message,
        result,
    };
};

const error = (statusCode: number, message: string): ErrorResponse => {
    return {
        status: false,
        statusCode,
        message,
    };
};

export {
    success,
    error,
};