import AuthController from "@/controllers/auth/auth.controller";
import catchAsync from "@/utils/catchAsync";
import { validateSchema } from "@/utils/validate";
import { signinSchema, verifySchema, resendOtpSchema, signupSchema, resetPasswordSchema, forgotPasswordSchema } from "@/utils/validators/auth.validation";
import { Router } from "express";

class AuthRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/signup",
            // @ts-ignore
            validateSchema(signupSchema),
            catchAsync(AuthController.signup)
        );
        this.router.post(
            "/verify",
            // @ts-ignore
            validateSchema(verifySchema),
            catchAsync(AuthController.verify)
        );

        this.router.post(
            "/resend-otp",
            // @ts-ignore
            validateSchema(resendOtpSchema),
            catchAsync(AuthController.resendOtp)
        );

        this.router.post(
            "/signin",
            // @ts-ignore
            validateSchema(signinSchema),
            catchAsync(AuthController.signin)
        );

        this.router.post(
            "/forgot-password",
            // @ts-ignore
            validateSchema(forgotPasswordSchema),
            catchAsync(AuthController.forgotPassword)
        )

        this.router.post(
            "/reset-password",
            // @ts-ignore
            validateSchema(resetPasswordSchema),
            catchAsync(AuthController.resetPassword)
        )
    }
}

export default new AuthRoutes().router;