import {autoDetectRenderer, Container} from 'pixi.js'

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

let renderer = autoDetectRenderer(1000, 1000);
document.body.appendChild(renderer.view);

let stage = new Container();
renderer.render(stage);
