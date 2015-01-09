# Marmelab ArchitectureViz

ArchitectureViz is a single page application to expose your system architecture into a nice vizialisation graph.

We generally use a client software to draw our system architecture schema, like Microsoft Visio &copy; for example. But often, only one member of the team has this software installed on his machine and the schema use a specific file format and there is no standard way to draw the schema. It become very hard to maintain during the software evolutions.

ArchitectureViz give you the possibility to maintain a JSON description file, using standard structure and informations.
It's simple to edit, using the user interface or by direct updating the json description file.

Made with D3.js and AngularJS.

## Installation

### Get the code

```bash
git clone git@github.com:marmelab/ArchitectureViz.git
cd ArchitectureViz
```

### Create data file

First, you have to create a json description of your system into `data.json` file.

To start, just copy the provided `data.json-dist` example file to `data.json`:

```bash
cp data.json-dist data.json
```

### Start static webserver

For example, by using the `PHP` one:

```bash
php -S localhost:4000
```

Or the `Python` one:

```bash
python -m SimpleHTTPServer 4000
```

Then, navigate to http://localhost:4000/.

## Usage

Details reveal when hovering a node.

You can edit the node by clicking on it, details on the right will be replaced by a form. For each modification, the JSON in the bottom textarea will be automaticaly updated. You will be responsable to manualy report the json modifications into the `data.json` file and commit it.

Filters on `name`, `technos` and `hosts` are avalaible on the left of the screen.

## Data description file

The `data.json` file allowing to describe your architecture in a json format.
It allows versionning by using git or another scm and edition by anyone of the project team members.

After any update of the description file, check that it works locally before committing (any JSON validation error will result in a blank screen). 
All charts rely on this data file.

Note that you can also edit the file thanks to the powerful interface.

### Format

Each element of your system is defined by a JSON node entry.

Here is a complete node definition example:

```json
{
    "name": "News",
    "children": [
        { "name": "World" },
        { "name": "Sport" }
    ],
    "url": "www.my-media-website.com/*",
    "dependsOn": ["Content API", "Xiti", "Search API", "OAS", "Account API", "    Picture API", "Router API"],    
    "technos": ["PHP", "Javascript", "Silex", "NGINX", "Varnish"],  
    "satisfaction": 0.9,
    "host": { "Amazon": ["fo-1", "fo-2"] }
}
```

### Properties

* `name`: name of your application
* `children`: list of application childrens, the mapping is done on the node `name` (you should be aware that two nodes cannot have the same name)
* `url`: url where the application is available (if any)
* `dependsOn`: list of application dependencies
* `technos`: list of technologies using by the application
* `satisfaction`: Corresponding to the overall quality of the application, it's a number between `0` and `1`
  * `1` for a good application
  * `0.8` for application which need some refactoring
  * `0.2` for a bad or not finished application
  * `0` for an horrible one or not yet started
* `host`: list of services where the application is hosted, grouped by name, with the list of corresponding server names or `?` if unknow (eg.: `{ "Amazon": ["front-1", "front-2"] }`, `"OVH": ["?"]`)

## License

ArchitectureViz is licensed under the [MIT Licence](LICENSE), courtesy of [marmelab](http://marmelab.com).
