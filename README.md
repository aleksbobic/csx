# COLLABORATION SPOTTING X

Collaboration spotting X (CSX) is a network-based visual-analytics application for exploring tabular data through network visualizations, interactions, and advanced network analytics. The core idea of CSX is to enable users to retrieve a subset of their dataset and provide tools for visual and interactive exploration and filtering of their retrieved data. You can also view a presentation video on Collaboration spotting on the following [link](https://zenodo.org/record/5877309).

![Collaboration Spotting X - Screenshot](https://github.com/aleksbobic/csx/blob/master/cover.png?raw=true)


## About & History 📖

This project was developed by **Aleksandar Bobić** as part of his PhD research during his time as a doctoral student at **CERN** and the **Graz University of Technology** under the supervision of his CERN supervisor **Jean-Marie Le Goff** and his TU Graz supervisor **Christian Gütl**.

This project was inspired by concepts introduced in the previous [Collaboration Spotting project](https://ercim-news.ercim.eu/en111/r-i/collaboration-spotting-a-visual-analytics-platform-to-assist-knowledge-discovery). We would like to thank the previous Collaboration Spotting team for their contributions.

### Contact ✉️
If you would like to collaborate or contribute to the project or have any questions feel free to send me an email to aleksandar.bobic@cern.ch.

## Involved institutions 🏫
Contributors from the following institutions were involved in the development of this project:
* [CERN](https://home.cern/)
* [Graz University of Technology](https://www.tugraz.at/home/)


## CITATION ✍️
If you happen to mention or use this project as part of one of your scientific works, please cite the following paper: Bobic, A., Le Goff, J. M., & Gütl, C. (2021). Collaboration Spotting X-A Visual Network Exploration Tool. In in Proceedings of the The Eighth International Conference on Social Networks Analysis, Management and Security: SNAMS 2021.

## Latest publications 📚
* Bobic, A., Le Goff, J. M., & Gütl, C. (2021). Towards supporting complex retrieval tasks through graph-based information retrieval and visual analytics. In CEUR Workshop Proceedings (Vol. 2950, pp. 30-37). RWTH Aachen. [Presentation Video](https://youtu.be/Xf-JHparbRA)
* Bobic, A., Le Goff, J. M., & Gütl, C. (2021). Collaboration Spotting X-A Visual Network Exploration Tool. In in Proceedings of the The Eighth International Conference on Social Networks Analysis, Management and Security: SNAMS 2021. [Presentation Video](https://zenodo.org/record/5877309)


## Getting started 🏁
To start developing this project, please complete the following steps:

1. Install docker on your local machine
2. Install python 3.7 or higher on your local machine
3. Clone the CSX project to your machine
4. Start docker
5. In a terminal, navigate to the project directory and run `docker-compose up`, which will start the app in development mode.
6. Once the project is running, it will be accessible on [http://localhost:8882](http://localhost:8882)
7. Before you can start exploring the example dataset, open another terminal and navigate to the `datasets_example` folder in the project folder
8. Run the following command in python `python populate_elastic.py jucssm jucs_sm.ndjson` to populate the CSX storage with the sample dataset
9. Refresh your browser page and start exploring

## Usage 🤔
Here is an example video showing how to use CSX once the example data has been loaded. It can be roughly divided into the following sections:

1. Performing an initial search on your dataset
2. Expressing a complex information need through the workflow designer
3. Exploring the overview network
4. Modifying the network schema
5. Exploring the detail network


![Collaboration Spotting X - Preview](https://github.com/aleksbobic/csx/blob/master/cover.gif?raw=true)

## Contributing 🧑‍💻
If you want to contribute to this project, pick an open issue you find interesting and create your branch (from the develop branch) with the issue number as the branch name. If there is no open issue for your feature, please open a new issue with a detailed description of the feature first.

Once you are happy with your implementation, open a pull request to the develop branch.


## Developing 🧑‍💻
### Starting the project and populating elastic with the sample dataset

Run `docker-compose up`, which will start the app in development mode.

Navigate to the `dataset_examples` in your terminal and run the following command to populate the running elastic instance with sample data collected from the [Journal of Universal Computer Science](https://lib.jucs.org/): `python populate_elastic.py jucssm jucs_sm.ndjson`. The first argument is the index name, and the second argument is the file name.

You can drop your custom dataset in the same folder and run the command by changing the parameters for the index name and the file name. The custom dataset should have the following format:

```JSON
{"index": {"_id": 0}}
{"Column 1": "Value 1.1", "Column 2": "Value 2.1", "Column 3": ["Value 3.1.1", "Value 3.1.2"]}
{"index": {"_id": 1}}
{"Column 1": "Value 1.2", "Column 2": "Value 2.2", "Column 3": ["Value 3.2.1", "Value 3.2.2", "Value 3.2.3"]}
```

A file containing the config for this dataset can be found in the `server/app/data/config` folder. This file can be used to modify your default config for the uploaded dataset. If you add more datasets, please make sure to name the config file of each new dataset the same as the index. **Dataset config files are necessary for each dataset!**

The config file has the following parameters:
```JavaScript
{
    "default_visible_dimensions": ["feature 1", "feature 2"], // Default visible features in detail network
    "anchor": "featur 2", // Default anchor node for both networks
    "links": ["feature 1"], // Default link features for both networks
    "default_search_fields": ["feature 2"], // Features used for searching through the start page searchbar
    "schemas": [ // Default schemas (can be left empty)
        {
            "name": "schema name",
            "relations": [
                {
                    "dest": "feature 1",
                    "src": "feature 2",
                    "relationship" "oneToOne" // Can be oneToOne, oneToMany, ManyToOne and manyToMany
                },
                {
                    "dest": "feature 2",
                    "src": "feature 3",
                    "relationship" "oneToMany"
                }
            ]
        }
    ]
}
```


Open [http://localhost:8882](http://localhost:8882) to view CSX in the browser and explore the newly added dataset.

### Starting the project in production mode 🚀

Run `docker-compose -f docker-compose.prod.yml up --build --remove-orphans`

Runs the app in production mode.
Open [http://localhost:8880](http://localhost:8880) to view it in the browser.