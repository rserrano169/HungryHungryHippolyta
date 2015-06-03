## Hungry Hungry Hippolyta!
**Hungry Hungry Hippolyta is a time trial browser game that was designed to look and feel like Pac-Man.**

One of the most challenging implementations for me, was the click-to-move guidance.  I used a breadth-first search function to determine the least number of valid moves to any clicked or touched(for touch screens) tile, then filled an array with the series of directions that would be required to follow along that fastest path.  Iterating through the array of directions, Hippolyta(the game character) would know which direction to move in, every step of the way.

Another somewhat tedious task was rendering the various Hippolyta faces, up, right, down, left, mouth-open, mouth-closed.  Before I tried to implement the changing of the faces, I had no reason to keep track of previous directions, but in order to make sure that Hippolyta was always facing the correct direction, I had to find a way to always keep track of the previous horizontal direction.  After that, I had to find a way to step through the game in such a way that the mouth-open/mouth-close rendering would still react accodring to previous and current events.  I did this by creating a three step rendering process, that would reset if interrupted by a change in Hippolyta's direction, or a full stop.

[Play What I've Made So Far!](http://rserrano169.github.io/HungryHungryHippolyta/html/hhh.html)
