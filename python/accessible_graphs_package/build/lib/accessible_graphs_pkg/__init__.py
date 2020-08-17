import webbrowser
from numbers import Number


def getAccessibleGraph(rawData, description='', minValue = None, maxValue = None):
    # TODO: allow the user to pass a list of lables and a list of values
    # TODO: warn the user if python version is < 3.6, because rawData could be not OrderedDict in that case
    if (type(description) is not str):
        raise Exception('The description type should be string')
    data = ''
    minimum = 0
    maximum = 0
    if (type(rawData) is dict):
        labels = rawData.keys()
        if (not _checkIfStrings(labels)):
            raise Exception('The labels for the graph should be strings')
        values = rawData.values()
        if (not _checkIfNumbers(values)):
            raise Exception('The data values should be numbers')
        dataLabels = '%09'.join(labels)
        dataValues = '%09'.join(str(value) for value in values)
        data = '{}%0A{}'.format(dataLabels, dataValues)
        minimum = min(values)
        maximum = max(values)
    elif (type(rawData) is list):
        if (not _checkIfNumbers(data)):
            raise Exception('The data values should be numbers')
        data = '%09'.join(str(dataElement) for dataElement in rawData)
        minimum = min(rawData)
        maximum = max(rawData)
    else:
        raise Exception('The data type should be dict or list')
    if (minValue is not None):
        minimum = minValue
    if (maxValue is not None):
        maximum = maxValue
    url = '''\
https://accessibleGraphs.org/view/index.html?\
data={}\
&description={}\
&minValue={}\
&maxValue={}\
&instrumentType=synthesizer'''\
    .format(data, description, minimum, maximum)
    webbrowser.open(url)


def _checkIfNumbers(itemsList):
    for item in itemsList:
        if (not isinstance(item, Number)):
            return False
    return True


def _checkIfStrings(itemsList):
    for item in itemsList:
        if (not type(item) is str):
            return False
    return True


if (__name__ == '__main__'):
    getAccessibleGraph({'Sunday': 1500, 'Monday': 1300, 'Tuesday': 1700, 'Wednesday': 2000,
                        'Thursday': 1000, 'Friday': 1450, 'Saturday': 1900}, 'Demo stock example')
