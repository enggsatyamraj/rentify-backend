export class AppError extends Error {
    status: boolean = false;
    code: number = 500;
    message: string = "";
    constructor(message: string, code: number) {
        super();
        this.message = message;
        this.code = code;
    }
}