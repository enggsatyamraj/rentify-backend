// src/routes/property.routes.ts

import { NextFunction, Request, Router } from "express";
import PropertyController from "../controllers/property/property.controller";
import { auth, ensureVerified, propertyImagesUpload } from "../middleware/auth.middleware";
import { validateSchema } from "../utils/validate";
import {
    createPropertySchema,
    updatePropertySchema,
    propertyIdSchema,
    getPropertiesSchema
} from "../utils/validators/property.validation";
import catchAsync from "../utils/catchAsync";

const parseFormDataBody = (req, res, next) => {
    if (req.body && req.body.body && typeof req.body.body === 'string') {
        try {
            // Replace req.body with the parsed JSON from the 'body' field
            req.body = JSON.parse(req.body.body);
            console.log('Parsed body:', req.body);
        } catch (error) {
            console.error('Error parsing body field:', error);
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON in body field'
            });
        }
    }
    next();
};

class PropertyRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Create property - Auth required
        this.router.post(
            "/",
            // @ts-ignore
            auth,
            ensureVerified,
            propertyImagesUpload, // First handle file upload
            (req: Request, res: Response, next: NextFunction) => {
                try {
                    // Parse the body data after file upload
                    const bodyData = JSON.parse(req.body.body);
                    req.body = bodyData; // Replace the body with parsed data
                    next();
                } catch (error) {
                    next(error);
                }
            },
            validateSchema(createPropertySchema),
            catchAsync(PropertyController.createProperty)
        );

        // Get all properties - Public route
        this.router.get(
            "/",
            // @ts-ignore
            validateSchema(getPropertiesSchema),
            catchAsync(PropertyController.getProperties)
        );

        this.router.get(
            "/user",
            // @ts-ignore
            auth,
            catchAsync(PropertyController.getUserProperties)
        )

        // Get single property - Public route
        this.router.get(
            "/:id",
            // @ts-ignore
            validateSchema(propertyIdSchema),
            catchAsync(PropertyController.getPropertyById)
        );

        // Update property - Auth required
        this.router.put(
            "/:id",
            // @ts-ignore
            auth,
            ensureVerified,
            propertyImagesUpload,
            parseFormDataBody,  // <-- Add this middleware
            validateSchema(updatePropertySchema),
            catchAsync(PropertyController.updateProperty)
        );

        // Delete property - Auth required
        this.router.delete(
            "/:id",
            //  @ts-ignore
            auth,
            ensureVerified,
            validateSchema(propertyIdSchema),
            catchAsync(PropertyController.deleteProperty)
        );

        // Toggle favorite - Auth required
        this.router.post(
            "/:id/favorite",
            // @ts-ignore
            auth,
            validateSchema(propertyIdSchema),
            catchAsync(PropertyController.toggleFavorite)
        );


    }
}

export default new PropertyRoutes().router;