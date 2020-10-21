These are design guidelines for accessible graphs, that we found helpful to think about while building our product at [accessiblegraphs.org](https://accessiblegraphs.org/).

We believe that they all play a crucial role in allowing the user to have a great experience and be able to understand the graph.

We accompany each guideline with the equivalent visual graph experience, and as an example, a description on how we address it in our product.

## 1. Overview

The ability to get a quick overview of the whole graph. In a visual graph, this would be a quick glance at the graph to understand its whole structure.

In our product, we allow this in 2 ways:

* Sounds: Turning off speech and with only tones, quickly passing over the graph using the right arrow keys, and listening to the graph’s melody
* Braille display: Simply passing your fingers over the braille display

## 2. Drill-down

The ability to drill-down to a specific area of the graph and get more information there. In a visual graph, this would be a focused look at a certain area, while looking back and forth to the x and y axis to map the height of the curve to the values.

In our product:

* Sounds: Selecting a value (by pressing space, the left/right arrows on the keyboard, or the rooting key on the braille display), provides more information such as y value, x value, position, and whether it’s the minimum or maximum
* Braille display: Pressing any of the above also provides a “zoom in” for the selected value on the right side of the braille display

## 3. Exposing the data’s values

A graph shows the structure of the data, but structure alone is not enough. It’s also important to know the actual values in the data. In a visual graph, the curve shows the structure, while the labels (sometimes called ticks) on the x and y axis show the values.

In our product:

* Sounds: when the user drills-down (as described above), we use speech to tell the user the actual value
* Braille display: In Jaws, when the speech is spoken, the braille display temporarily shows the speech, and then goes back to the graph representation

## 4. Ability to compare different areas

The ability to compare different areas of the graph easily and jump from one to the other quickly. In a visual graph, this would be moving the glance back and forth between 2 areas.

In our product:

* Keyboard: Using the numbers row on the keyboard, the user can jump to different areas of the graph. There are 10 number keys, which map to a set of x values. Initially the set is 1–10, and the user can switch to the next set using the -= keys (on the right of the numbers). The next set would be 11–20, then 21–30 and so on
* Braille display: The rooting keys allow the user to jump to different areas of the graph quickly

## 5. Ability to compare different graphs

The ability to compare different graphs that share the same x axis. In a visual graph, the graphs can be presented together as 2 or more curves with different colors.

In our product we plan to support this by using the up/down arrow keys to quickly switch between graphs, while staying at the same x position.

## 6. Use existing data

The ability to create an accessible graph from user data, that may be present in different formats.

In our product, we allow the user to:

* Copy-paste data from spreadsheet software like Excel or Google Sheets
* Use existing websites that have already integrated our graphs, such as
[https://financialmodelingprep.com](https://financialmodelingprep.com)
which shows real-time financial information on stocks, indexes, currencies etc
* For python developers: Use python data structures such as lists and dicts and create accessible graphs from them. Just pip install accessible-graphs. Here’s a
[link to the package](https://pypi.org/project/accessible-graphs/)
with more details
* For website developers: Integrating with our website to provide accessible graphs for your data is as easy as constructing a url with the data. There’s not even a dependency you need to include

## 7. Platform

For the accessible graph to be useful, it needs to be on a platform that’s widely available to users. We chose the web as a ubiquitous platform. To illustrate the point, an example of a platform that’s not widely available is on a specific hardware device that the user needs to purchase.

## Summary

We believe that these guidelines are important to create truly accessible graphs. We believe that they are all fundamental requirements to an accessible graph, and hope that they can serve as guidelines for accessible graph developers and those that are evaluating accessible graph solutions.

If you find this interesting or have any questions, feel free to reach out at:
[https://twitter.com/AccessibleGraph](https://twitter.com/AccessibleGraph)
