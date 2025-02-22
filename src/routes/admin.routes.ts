// routes/admin.routes.ts
import { Router } from "express";
import { auth, isAdmin } from "../middleware/auth.middleware";
import catchAsync from "../utils/catchAsync";
import { validateSchema } from "../utils/validate";
import { z } from "zod";
import AdminController from "../controllers/admin.controllers";

// Validation schemas for admin routes
const verifyPropertySchema = z.object({
    isVerified: z.boolean({
        required_error: "Verification status is required",
    })
});

class AdminRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Get all properties with optional filters
        this.router.get(
            "/properties",
            // @ts-ignore
            auth,
            isAdmin,
            catchAsync(AdminController.getAllProperties)
        );

        // Toggle property verification status
        this.router.patch(
            "/properties/:propertyId/verify",
            // @ts-ignore
            auth,
            isAdmin,
            validateSchema(z.object({
                body: verifyPropertySchema
            })),
            catchAsync(AdminController.togglePropertyVerification)
        );
    }
}

export default new AdminRoutes().router;