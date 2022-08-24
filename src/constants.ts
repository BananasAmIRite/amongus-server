// TODO: phase this file out in favor of changing settings ingame
export const IMPOSTER_AMOUNT = 1;
export const TASK_AMOUNT = 5;
export const TASK_RADIUS = 10;

/* should not be ingame setting
   maps are gonna be images, but the collision map is gonna be per-pixel, 
   so if a collision block is at (0, 0) and the map tile size is 100x100,
   the first 100x100 pixels (so (0, 0) to (100, 100)) in the image will not be accessible

   ** coordinates will be in map pixel coordinates

   in short, in game, the collision map is scaled up to the MAP_TILE_SIZE and compared to see if anything collides or not
*/
export const MAP_TILE_SIZE = 100;
