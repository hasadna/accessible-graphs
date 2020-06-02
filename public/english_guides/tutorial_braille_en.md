## Introduction
Welcome to the Sensory Interface tutorial! 
The tutorial aims to provide you with a walk-through on using braille in our system. 
Braille greatly enhances the experience of using our system, and this tutorial shows you how we use braille to achieve that experience. 
Before we continue the tutorial, please: 

* Connect a braille display to your computer
* Configure the screen reader to use it if necessary

---

## Stage 1 - Drawing with braille
Let’s try to understand how we use braille in our system. 
So, we use braille in a very unconventional way. To give you an initial taste of how we use braille and the braille display, let’s “look” at the following shape we draw on the braille display:

⠊⠉⠑⢄⣀⡠⠊⠉⠑⢄⣀⡠⠊

So, we are “seeing” a wave that goes up and down, up and down, again and again. See how we used braille to draw something? These are not text characters. We will be using the braille display as a sort of drawing pad to draw up our visualizations.

---

## Stage 2 - As easy as 1 2 3 4
After we had an initial taste of how we are using braille in our system, let’s dive more deeply into how exactly we present data using braille. 
So, as you might know, we want to present numerical data using braille, speech, and tones. In this tutorial, we will focus on braille only. 
separated with commas: 

1, 2, 3, 4 

According to our algorithm, we map each one of the numbers to a different braille pattern as follows: 

* ⣀ - This pattern (dots 7 and 8) presents the value of 1.
* ⠤ - This pattern (dots 3 and 6) presents the value of 2.
* ⠒ - This pattern (dots 2 and 5) presents the value of 3.
* ⠉ - This pattern (dots 1 and 4) presents the value of 4.

Therefore, our braille representation of “1 2 3 4” will look like this: 

⣀⠤⠒⠉ 

---

## Stage 3 - Another example
Let’s now have a more advanced example: Let’s assume we want to present the following data in braille, again, separated by commas: 

1, 2, 3, 4, 3, 2, 1 

Then, according to the method we just described, we will get the following braille representation: 

⣀⠤⠒⠉⠒⠤⣀ 

---

## Stage 4 - Representing numbers 1 to 20
Now, what happens if we have more than 4 characters to display? For example, let’s say we want to present the numbers from 1 to 20 in braille: 

1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 

We know how to map 1 2 3 4, but how would we map 5 and above? As you can see, we can’t use the same method as before, because we have more than 4 values. 
To present this data, we divide the range of 1 to 20 into 4 equal subranges. Each braille pattern represents one subrange of the data: 

*  ⣀ will represent any value from 1 to 5
* ⠤ will represent any value from 6 to 10
* ⠒ will represent any value from 11 to 15
* ⠉ will represent any value from 16 to 20

So in braille, our numbers from 1 to 20 will look like this: 

⣀⣀⣀⣀⣀⠤⠤⠤⠤⠤⠒⠒⠒⠒⠒⠉⠉⠉⠉⠉ 

---

## Stage 5 - Looking at complex data
Now that we have a basic understanding of how we represent numerical data using our special braille patterns, let’s try to “look” at more complex data. This data can describe some graph for example. 
Let’s assume we have the following data as input, separated by commas: 

12, 31, 22, 5, 70, 62, 43, 55, 80, 25, 39, 1 

First, we notice that our set of values ranges from 1 to 80, Therefore, we have to divide our range to 4 equal subranges as follows: 

* ⣀ will represent any value from 1 to 20
* ⠤ will represent any value from 21 to 40
* ⠒ will represent any value from 41 to 60
* ⠒ will represent any value from 61 to 80

The first value in our data is 12. This value is found in the first subrange, so we represent it with the pattern of the first subrange: 

⣀ 

The second value is 31, found in the second subrange, so it’s represented with the second subrange pattern. Let’s add it to the sequence: 

⣀⠤ 

The third is 22, also found in the second subrange. Let’s add it too: 

⣀⠤⠤ 

Then comes 5, which is in the first subrange, and we get: 

⣀⠤⠤⣀ 

Next is 70, found in the 4th subrange: 

⣀⠤⠤⣀⠉ 

By now you probably got a general idea of what things look like in our braille representation. Let’s “see” how the final output looks like: 

⣀⠤⠤⣀⠉⠉⠒⠒⠉⠤⠤⣀ 

So, after you have reviewed the braille representation of the numerical data, do you think you can get “a feeling of the graph”? We think you can! 😊 

---

## Stage 6 - Looking at different number ranges
Let’s now talk about some interesting case where the range doesn’t start from 1. Rather, it starts from some arbitrary value, let’s say 1001. So, in that case, what will the braille representation look like? Let’s assume we want to represent the range from 1001 to 1020. This is our input: 

1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020 

As we did before, we divide the range to 4 equal subranges as follows: 

* ⣀ will represent any value from 1001 to 1005
* ⠤ will represent any value from 1006 to 1010
* ⠒ will represent any value from 1011 to 1015
* ⠉ will represent any value from 1016 to 1020

As a result of this, the output will look like this: 

⣀⣀⣀⣀⣀⠤⠤⠤⠤⠤⠒⠒⠒⠒⠒⠉⠉⠉⠉⠉ 

Can you notice that our output looks exactly as in section 4, where we showed 1 to 20? So, you might ask: how I am supposed to distinguish between the 2 cases? The answer is simple, via braille you can’t! However, in such situations, speech comes into play. It will help you to determine the exact value you are examining. 

---

## Configuring your screen reader
Configure your screen reader to actually stplit words in braille. In other words, if the complete word can’t be displayed on the braille display, your screen reader shouldn’t try to not split it. In NVDA for example, you can do this by going to NVDA Menu > Preferences > Settings > Braille and unchecking the checkbox which says “Avoid splitting words when possible”. This is necessary to have braille work as expected in the system. 