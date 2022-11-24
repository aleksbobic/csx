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

## Selected publications 📚
* Bobic, A., Le Goff, J. M., & Gütl, C. (2021). Towards supporting complex retrieval tasks through graph-based information retrieval and visual analytics. In CEUR Workshop Proceedings (Vol. 2950, pp. 30-37). RWTH Aachen. [Presentation Video](https://youtu.be/Xf-JHparbRA)
* Bobic, A., Le Goff, J. M., & Gütl, C. (2021). Collaboration Spotting X-A Visual Network Exploration Tool. In in Proceedings of the The Eighth International Conference on Social Networks Analysis, Management and Security: SNAMS 2021. [Presentation Video](https://zenodo.org/record/5877309)


## Getting started 🏁
To start developing this project, please complete the following steps:

1. Install docker on your local machine
2. Clone the CSX project to your machine
3. Start docker
4. In a terminal, navigate to the project directory and run `docker-compose up`, which will start the app in development mode.
5. Once the project is running, it will be accessible on [http://localhost:8882](http://localhost:8882)
6. Before you can start exploring the example dataset, open `datasets_example` folder and drag and drop the example file `just_sm.csv` into the csx drop zone.
7. Rename the dataset name to jucssm
8. Set `Title` as the anchor and default search column (click on the radio button in the first column and the checkbox in the third column)
9. Set `Authors` as the link (click on the radio button in the second column)
10. Click set defaults
11. After a short period the dataset should be ready for exploration

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

Run `docker-compose up`, which will start the app in development mode on [http://localhost:8882](http://localhost:8882)

Navigate to the `dataset_examples` folder and drag and drop the example file `just_sm.csv` into the csx drop zone to populate the running elastic instance with sample data collected from the [Journal of Universal Computer Science](https://lib.jucs.org/).


To add a custom dataset simply prepare a CSV file with the following format (make sure there are no single quotation marks in the text since that might interfere with the automatic processing of list values):

| String feature name   | Category feature name                   | Number feature name | List feature name       |
| --------------------- | --------------------------------------- | ------------------- | ----------------------- |
| Some string value.    | Categorical val 1                       | 1                   | ["val1","val2","val3"]  |
| Another string value  | Categorical val 2 (same as a string)    | 4.35                | ["val6","val4","val1"]  |


When the dataset is uploaded a config file is created in the `server/app/data/config` folder. This file defines the default configuration for a dataset.

> 🚨 **Config files should never be manually modified. If you want to modify the config of a dataset either click on the change default settings for dataset button next to each of the datasets on the homepage or delete the dataset and upload it again with different settings.**:

### Disabling upload form
To disable the upload form please go to the `docker-compose.yml` file set the `REACT_APP_DISABLE_UPLOAD` under `app` and `environment` to true.


### Starting the project in production mode 🚀

Run `docker-compose -f docker-compose.prod.yml up --build --remove-orphans --force-recreate`

Runs the app in production mode.
Open [http://localhost:8880](http://localhost:8880) to view it in the browser.
