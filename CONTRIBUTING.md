# Contributing
[Contributing]:
  #contributing


When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners (currently, [oferb](https://github.com/oferb)) of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.


------


- [Contributing]

- [Development Setup]

  - [Very important point about simplicity]

- [Fork Setup]

- [Pull Request Process]

- [Code of Conduct]


------


## Development Setup
[Development Setup]:
  #development-setup


As of now, all our code is client side. We use Typescript, and compile it into js files. The generated js files are also stored in the repo.
You could say that's redundant, but, it's still a small project and we think it's simpler that way.

**Prerequisite**


- NPM, for converting (transpiling) TypeScript to JavaScript

- Python3, if using `npm run py-server`


**Downloading Source Code**


```Bash
git clone git@github.com:hasadna/sensory-interface.git
```


**Installing or Updating Dependencies**


```Bash
cd sensory-interface

git pull origin master

npm install
```


**Transpile TypeScript to JavaScript**


```Bash
npm run build
```


**Run Python3's `http.server`**


```Bash
npm run py-server
```


**Preview Changes**

visit "http://localhost 8080"

> Note, if Python version 3 is not available, it is possible, at this time, to instead preview via visiting:
file:///<path_to_repo>/public/index.html

> ... however, this is **not** recommended as some web-browsers do not take kindly to loading JavaScript from `file:///` paths, and some web-browsers really do not like loading JavaScript this way when there are remote JavaScript files involved, eg. JQuery.
>
> In short, if problems occur with `file:///` based paths, please try utilizing a development web-server before opening an Issue.


### Very important point about simplicity
[Very important point about simplicity]:
  #very-important-point-about-simplicity


We strongly prefer simple solutions and in general keeping everything as simple as possible.
That includes any developer setup or knowledge needed by the developer to work on the project.
It also includes dependencies, tools, processes, integration with external services, and so on.

Please keep that in mind when working on the project. We value any input, and welcome any discussions on adding new things,
but please bear this in mind so you won't get disappointed or discouraged if we don't add something you propose
(or that you will need to do some more convincing than perhaps usual).


## Fork Setup
[Fork Setup]:
  #fork-setup


[Fork this Repository](https://github.com/hasadna/sensory-interface/fork) to an Account or Organization with push permissions.


```Bash
cd sensory-interface
```

**Add Fork URL**


```Bash
_git_name="YourName"

git remote add fork git@github.com:${_git_name}/sensory-interface.git
```


**Fetch and Checkout `fork/master`**


```Bash
git fetch fork master

git checkout fork/master
```


**Pushing Changes to Fork**


```Bash
git push fork fork/master:master
```

> Note, syntax is `<local-branch>:<remote-branch>` when being explicit is required, however, `git push fork master` is often sufficient.


## Pull Request Process
[Pull Request Process]:
  #pull-request-process


All changes should be approved prior to merging to `master`, by one of the project owners.


## Code of Conduct
[Code of Conduct]:
  #code-of-conduct


This is our project's code of conduct:

https://www.contributor-covenant.org/version/2/0/code_of_conduct

Under the "Enforcement" section, replace [INSERT CONTACT METHOD] with info@accessiblegraphs.org

Thanks and happy coding! :-)
