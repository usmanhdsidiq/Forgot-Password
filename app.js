require("./sentry/instrument");
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const notifications = require('./routes/notifications');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

//app.use(Sentry.Handlers.requestHandler());
Sentry.setupExpressErrorHandler(app);
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, './views')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.use((req, res, next) => {
    res.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});

app.use('/auth', authRoutes);
app.use('/password', passwordRoutes);
app.use('/', notifications);
app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})