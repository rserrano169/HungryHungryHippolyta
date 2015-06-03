## Hungry Hungry Hippolyta!
**Hungry Hungry Hippolyta is a time trial browser game that was designed to look and feel like Pac-Man.**

One of the most challenging implementations for me, was the click-to-move guidance.  I used a breadth-first search function to determine the least number of valid moves to any clicked or touched(for touch screens) tile, then filled an array with the series of directions that would be required to follow along that fastest path.  Iterating through the array of directions, Hippolyta(the game character) would know where which way to go every step of the way.

[Play What I've Made So Far!](http://rserrano169.github.io/HungryHungryHippolyta/html/hhh.html)
