const Koa = require('koa');
const KoaRouter = require('koa-router');
const logger = require('koa-logger');

const PORT = 8080;

const app = new Koa();
const router = new KoaRouter();

router.get('/', context => context.body = 'Success!');

app.use(logger());
app.use(router.routes());
app.use(router.allowedMethods());

console.log('Listening on port', PORT);

app.listen(PORT);
