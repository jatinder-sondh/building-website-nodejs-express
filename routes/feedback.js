const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const validations = [
    check('name').trim().isLength({ min: 3 }).escape().withMessage("A Name is required"),
    check('email').trim().isEmail().normalizeEmail().withMessage("A valid Email address is required"),
    check('title').trim().isLength({ min: 3 }).escape().withMessage("A Title is required"),
    check('message').trim().isLength({ min: 3 }).escape().withMessage("A Message is required"),
]

module.exports = (params) => {
    const { feedbackService } = params;

    router.get("/", async (request, response, next) => {
        try {
            const feedback = await feedbackService.getList();

            const errors = request.session.feedback ? request.session.feedback.errors : false;
            const successMessage = request.session.feedback ? request.session.feedback.message : false;
            request.session.feedback = {};

            return response.render('layout', { pageTitle: 'Feedback', template: 'feedback', feedback, errors, successMessage });
        } catch (error) {
            return next(error);
        }
    });

    router.post("/", validations, async (request, response, next) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                request.session.feedback = {
                    errors: errors.array(),
                };
                return response.redirect('/feedback');
            }

            const { name, email, title, message } = request.body;
            await feedbackService.addEntry(name, email, title, message);
            request.session.feedback = {
                message: "Thank you for your feedback",
            };
            return response.redirect('/feedback');
        } catch (error) {
            return next(error);
        }
    });

    return router;
};