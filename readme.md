# PySmart - The _smart_ way to manage python

In normal python you have to do annoying things like virtual env.

But not with _PySmart_!

Using simple, familiar tools like package.json, PySmart allows you to manage all your dependencies in one simple folder with the basic functionality of package.json. Here are simple commands:

```shell
pys init
```

This creates a python_modules folder, and prompts you to select your python version.  This doesn't work with system installed python so you have to install one yourself.  But this will be done in the future automatically for you (it has to for "smart" python!)

This command also creates a simple .vscode/settings.json that has the correct python modules, etc set up so intellisense works.  Please submit a pull request containing config for other editors until this becomes the norem (I hope!)

```shell
pys install <package1> <package2> ...
```

Install packages just like node modules! This will install the packages in the python_modules folder and save a package-lock and package.json

Note: the package-lock.json doesn't actually do anything right now :)
