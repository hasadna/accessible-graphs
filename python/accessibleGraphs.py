import webbrowser
from numbers import Number


def getAccessibleGraph(rawData, description=''):
    if (type(description) is not str):
        raise Exception('The description type should be string')
    data = ''
    minValue = 0
    maxValue = 0
    if (type(rawData) is dict):
        labels = rawData.keys()
        if (not _checkIfStrings(labels)):
            raise Exception('The labels for the graph should be strings')
        values = rawData.values()
        if (not _checkIfNumbers(values)):
            raise Exception('The data values should be numbers')
        dataLables = '%09'.join(labels)
        dataValues = '%09'.join(str(value) for value in values)
        data = '{}%0A{}'.format(dataLables, dataValues)
        minValue = min(values)
        maxValue = max(values)
    elif (type(rawData) is list):
        if (not _checkIfNumbers(data)):
            raise Exception('The data values should be numbers')
        data = '%09'.join(str(dataElement) for dataElement in rawData)
        minValue = min(rawData)
        maxValue = max(rawData)
    else:
        raise Exception('The data type should be dict or list')
    url = '''\
https://accessibleGraphs.org/view/index.html?\
data={}\
&description={}\
&minValue={}\
&maxValue={}\
&instrumentType=synthesizer'''\
    .format(data, description, minValue, maxValue)
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
