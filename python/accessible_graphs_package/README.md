# Accessible graphs package

This package enables you to experience graphs in an accessible manner if you're a blind person who uses a screen reader with or without a braille display.

## How it works?

To get the accessible graph, you need to:
* Import the package as follows:

    import accessible_graphs_pkg
* Call the function "getAccessibleGraph" as follows:

    accessible_graphs_pkg.getAccessibleGraph(rawData, description, minValue, maxValue)

The "getAccessibleGraph function accepts 4 arguments:
* raw Data - which could be:
  * A list of numerical values representing the graph
  * A dict, where the keys are the labels for the data, and the values are the numbers corresponding to each label
* description - an optional string describing the graph
* minValue - an optional argument which tells the system that this is the minimum value. If not specified, the system calculates this value automatically based on the data range
* minValue - an optional argument which tells the system that this is the minimum value. If not specified, the system calculates this value automatically based on the data range
* maxValue - an optional argument which tells the system that this is the maximum value. If not specified, the system calculates this value automatically based on the data range

### Example 1

Suppose we want to make the following graph accessible, represented by the following values:

1500, 1300, 1700, 2000, 1000, 1450, 1900

Suppose also we want to give the description "Demo stock example" to our graph.

Then we call our function as follows:

    accessible_graphs_pkg.getAccessibleGraph([1500, 1300, 1700, 2000, 1000, 1450, 1900], 'Demo stock example')

We then are supposed to get a graph similar to the one in [this link](https://accessiblegraphs.org/view/index.html?data=1500%09%22%201300%22%09%22%201700%22%09%22%202000%22%09%22%201000%22%09%22%201450%22%09%22%201900%22&description=Demo%20stock%20example&minValue=1000&maxValue=2000&instrumentType=synthesizer&ttsName=noTts)

Note that the minimum and maximum values are calculated automatically in this example.

### Example 2

Let's now talk about more realistic example. Suppose we want to get the graph describing the following stock to be accessible, when represented by a list of key-value pairs, where the key is the day in the week, and the value is the value of the stock:

Sunday: 1500

Monday: 1300

Tuesday: 1700

Wednesday: 2000

Thursday: 1000

Friday: 1450

Saturday: 1900

Suppose also we want to give the description "Demo stock example" to our graph as before.

Then we call our function as follows:

    accessible_graphs_pkg.getAccessibleGraph({'Sunday': 1500, 'Monday': 1300, 'Tuesday': 1700, 'Wednesday': 2000, 'Thursday': 1000, 'Friday': 1450, 'Saturday': 1900}, 'Demo stock example')

Then we are supposed to get a graph similar to the one in [this link](https://accessiblegraphs.org/view/index.html?data=Sunday%09Monday%09Tuesday%09Wednesday%09Thursday%09Friday%09Saturday%0A1500%091300%091700%092000%091000%091450%091900&description=Demo%20stock%20example&minValue=1000&maxValue=2000&instrumentType=synthesizer)

Note that the minimum and maximum values are calculated automatically in this example.

### Example 3
Suppose we want to make the graph represented by the following data to be accessible:

1, 2, 3, 4, 5

Suppose also we want to tell the system that the minimum value should be 2, and the maximum should be 4. Then we call our function as follows:

    accessible_graphs_pkg.getAccessibleGraph([1, 2, 3, 4, 5], description = 'some description', minValue= 2, maxValue = 4)

## Some useful links

* [Accessible Graphs basic guide](https://accessiblegraphs.org/english_guides/usage_tutorial_en.html?lang=en)
* [Accessible Graphs braille tutorial](https://accessiblegraphs.org/english_guides/tutorial_braille_en.html?lang=en)