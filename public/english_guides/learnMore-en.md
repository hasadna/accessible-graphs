We live in a visual world where data and content are presented using graphical interfaces. The data and content
are presented in a variety of ways and in many cases visual content can be made accessible so that blind people can access the content using screen reader software and Braille displays. And despite the tremendous advances in the accessibility of websites, mobile apps, computer software and digital documents, still one area remains unanswered. Access to quantitative data shown in graphs and charts is not accessible to many people with visual impairment and blindness. Most graphs are presented as images that include the data in the graph. Although alternate text can be added to graph images - in most cases, the details provided in the alternate text do not provide full detail of the graph. It is also not easy to understand the various trends reflected in the graph such as average, minimum value, maximum and other details that can be felt through vision.

The [Accessible Graphs Project](https://accessiblegraphs.org/) aims to remove this barrier by developing a dedicated system designed for people with visual impairment and blindness, that will also help people who have difficulties perceiving or understanding visual data such as graphs and charts. The system can help the user by providing a simpler way to view graphs, and at the same time, to provide accessibility for screen reader users.

## Experiencing the accessible graph 

The graph is made accessible by a simple user interface that uses speech, tones and touch:

* Speech: Using the Windows built-in Text To Speech voices or screen reader software such as NVDA and JAWS
* Tones: using spatial sound that reflects the numerical data values
* Touch: using a Braille display

Also, the user can choose to hear the entire graph by pressing the read entire graph button.

## Browser and screen reader support

Currently the system works best on Windows with the following screen reader and browser combinations:

* NVDA 2019 or later with Mozilla Firefox
* NVDA 2019 or later with Google Chrome or Microsoft Chromium Edge
* JAWS 2019 or later with Google Chrome and Microsoft Chromium Edge

## How the system works

An end user with a visual impairment or blindness can access a given accessible graphs and navigate it using screen reader software and / or a Braille display. At any given moment, a user can get more information about the graph such as minimum, maximum, average values and more. In addition, while navigating the graph, the system produces a spatial sound that helps the user understand the trends of change in the graph – that is, an increase or decrease in the numerical value.

For example, a blind user can access a collection of 14,000 different stocks from all over the world, as well as currency exchanges, indexes and bitcoin prices, and review the trends of change and fluctuations in a graph. Anyone can experience the accessible stock graphs in the [accessible stock web page](https://accessiblegraphs.org/stockMarket.html). Just choose one of the technology companies and browse the accessible stock graph page.

## Navigating the graph with a keyboard

* Navigating the graph using simulated braille display routing keys, when using a standard keyboard
* When the focus is on the graph view area, the user can use the number keys (1 to 0, both on the top numbers row and the numpad keys) to jump to the corresponding position in the graph
* If the graph has more than 10 values, the user can use minus (-) and equals (=) keys to move to the next and previous 10 positions
* Also, the user can use standard arrow keys to navigate the graph

## Navigating the graph with a braille display

* The left side of the braille display (cells 1 to 29) displays an overview of the graph. This part is static.
* The 30th cell is a separator between the left and the right sides
* The right side (cells 31 to 40) displays the data element under the cursor in the left side more accurately. You can think of the right side as an area where the data element under the cursor is displayed under a greater magnification level

When using a Braille display, the user can navigate the graph using the navigation keys on the Braille display or keyboard shortcuts used by screen reader users. Each time the numeric value under the cursor changes, depending on the numeric value, the tactile output will lengthen or shorten in a way that illustrates to the user the relative height of the number relative to the other numbers in the value range of the graph. More detailed explanation can be found on the [Accessible Graphs website on the Braille tutorial page](https://accessiblegraphs.org/english_guides/tutorial_braille_en.html?lang=en). Here we’ll just leave you with a little taste of the interesting things a Braille display can draw:

⠊⠉⠑⢄⣀⡠⠊⠉⠑⢄⣀⡠⠊

## Design guidelines

We have created a guide with design guidelines for accessible graphs. These are guidelines that we found helpful to think about while building our product. We believe that they all play a crucial role in allowing the user to have a great experience and be able to understand the graph.You're welcome to read about it in our [Accessible Graphs Design Guidelines guide](guidelines-en.html).

## Our Vision

A system for making graph accessible can provide a solution to many accessibility barriers faced by people with visual impairments and blindness as students, as employees and as people seeking to be exposed to information displayed in graphs across the internet. One of the important benefits of a system for making graphs accessible, is the ability to help a more successful integration of people with blindness in workplaces where there is a need to collect and analyze graph information, such as financial, business, analysis, science and computer algorithms related jobs.

This project is funded by the Israel Innovation Authority, and is run by The Public Knowledge Workshop (a nonprofit organization). The funding for the project will end at the end of September 2020 and from there we hope that everyone who wishes to continue using the system can do so on our website, or by using the open source code.

## Integrating accessible graphs on a website

Integration with Accessible Graphs is super easy.

All you need to do, is create a url with the data as part of the url.

* The URL will direct users to [accessiblegraphs.org](http://accessiblegraphs.org/) and open up an accessible graph with the data you provided
* Here's an example of such a url:
[https://accessiblegraphs.org/view/index.html?data=Sunday%09Monday%09Tuesday%09Wednesday%09Thursday%09Friday%09Saturday%0A1500%091300%091700%092000%091000%091450%091900&description=Demo%20stock%20example&minValue=1000&maxValue=2000&instrumentType=synthesizer](https://accessiblegraphs.org/view/index.html?data=Sunday%09Monday%09Tuesday%09Wednesday%09Thursday%09Friday%09Saturday%0A1500%091300%091700%092000%091000%091450%091900&description=Demo%20stock%20example&minValue=1000&maxValue=2000&instrumentType=synthesizer)
* Here's an example javascript code that creates the url:
[https://github.com/hasadna/accessible-graphs/blob/master/public/demo.html](https://github.com/hasadna/accessible-graphs/blob/master/public/demo.html)
* Here's the same code deployed:
[https://accessiblegraphs.org/demo.html](https://accessiblegraphs.org/demo.html)
Note that to see it, you'd need to "View source".

## See also

* Visit our website at [https://accessiblegraphs.org](https://accessiblegraphs.org)
* View over 14,000 accessible graphs of stocks, currencies, indexes and bitcoins: [https://accessiblegraphs.org/stockMarket.html](https://accessiblegraphs.org/stockMarket.html)
* Our Python library that gives accessible graphs for numerical data in python (lists, dicts etc):
[https://pypi.org/project/accessible-graphs](https://pypi.org/project/accessible-graphs)
* Creating your own accessible graph using Excel spreadsheet:
[https://accessiblegraphs.org/builder/index.html](https://accessiblegraphs.org/builder/index.html)
* Our project’s open-source code:
[https://github.com/hasadna/accessible-graphs](https://github.com/hasadna/accessible-graphs)
* If your website contains graphs, you can use an example code to implement the system on your website:
[https://github.com/hasadna/accessible-graphs/blob/master/public/demo.html](https://github.com/hasadna/accessible-graphs/blob/master/public/demo.html)
* Here’s the same page, deployed:
[https://accessiblegraphs.org/demo.html](https://accessiblegraphs.org/demo.html)
