const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session')
const createError = require('http-errors')

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json')
const speakersService = new SpeakersService('./data/speakers.json')

const routes = require('./routes');
const app = express();

const port = 3000;

app.set("trust proxy", 1);

app.use(cookieSession({
    name: 'session',
    keys: ['Shizu', 'Sizuuuu']
}))


app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "./views"));

app.locals.siteName = "Jatinder Kaur";

app.use(express.static(path.join(__dirname, './static')));

app.use(async (request, response, next) => {
    try {
        const names = await speakersService.getNames();
        response.locals.speakerNames = names;
        return next();
    } catch (error) {
        return next(error);
    }
});


app.use("/throw", (request, response, next) => {
    setTimeout(() => {
        return next(new Error('something did throw'));
    }, 5000);
});

app.use('/', routes({
    feedbackService,
    speakersService
}));


app.use((request, response, next) => {
    return next(createError(404, "File not found"))
})

app.use((err, request, response, next) => {
    response.locals.message = err.message;
    const status = err.status || 500;
    response.locals.status = status;
    response.status(status);
    response.render('error')
})

app.listen(port, () => {
    console.log("Express server on port", port)
});