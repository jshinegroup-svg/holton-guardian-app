import type {WorldId} from './lib/journeys';
import {chapterSceneIndex} from './lib/journeys';
export const chapterArt = {
 sky: [require('../assets/worlds/chapters/sky-0.png'), require('../assets/worlds/chapters/sky-1.png'), require('../assets/worlds/chapters/sky-2.png')],
 forest: [require('../assets/worlds/chapters/forest-0.png'), require('../assets/worlds/chapters/forest-1.png'), require('../assets/worlds/chapters/forest-2.png')],
 cosmos: [require('../assets/worlds/chapters/cosmos-0.png'), require('../assets/worlds/chapters/cosmos-1.png'), require('../assets/worlds/chapters/cosmos-2.png')],
};
export const chapterScene = (world:WorldId, count:number) => chapterArt[world][chapterSceneIndex(count)];
