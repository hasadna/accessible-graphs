import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="accessible_graphs", 
    version="0.0.3.1",
    author="Mohammad Suliman",
    author_email="mohmad.s93@gmail.com",
    description="A package to make specific types of graphs accessible to low vision and blind users",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/hasadna/accessible-graphs",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)