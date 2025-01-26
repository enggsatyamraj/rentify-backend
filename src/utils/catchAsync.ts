import { Request, Response, NextFunction } from "express"
import { AppError } from "./appError"



export default (func: Function, message?: string) => {
    return (req: Request, res: Response, next: NextFunction) => {

        func(req, res, next).catch((error: AppError) => {
            // logger.error(`FATAL ERROR : ${error}`)
            if (error.code === 11000)
                error.code = 400

            next(new AppError(error.message, error.code || 500))
        })
    }
}