import pandas as pd
import math
from app.config import settings
import pyalex


class OpenAlexSearchResults:
    def __init__(self, page_size=200):
        self.__page_size = page_size

        if settings.openalex_email != "":
            pyalex.config.email = settings.openalex_email

    def __get_author_names(self, paper):
        return [
            author_object["author"]["display_name"]
            for author_object in paper["authorships"]
        ]

    def __get_author_ids(self, paper):
        return [author_object["author"]["id"] for author_object in paper["authorships"]]

    def __get_institutions(self, paper):
        return [
            author_object["institutions"][0]["display_name"]
            if author_object["institutions"]
            and len(author_object["institutions"]) > 0
            and author_object["institutions"][0]
            and author_object["institutions"][0]["display_name"]
            else ""
            for author_object in paper["authorships"]
        ]

    def __get_institution_countries(self, paper):
        return [
            author_object["institutions"][0]["country_code"]
            if author_object["institutions"]
            else ""
            for author_object in paper["authorships"]
        ]

    def __get_institution_types(self, paper):
        return [
            author_object["institutions"][0]["type"]
            if author_object["institutions"]
            else ""
            for author_object in paper["authorships"]
        ]

    def __get_institution_ids(self, paper):
        return [
            author_object["institutions"][0]["id"]
            if author_object["institutions"]
            else ""
            for author_object in paper["authorships"]
        ]

    def __get_concepts(self, paper, property, level):
        return [
            concept_object[property]
            for concept_object in paper["concepts"]
            if concept_object["score"] > 0.3 and concept_object["level"] == level
        ]

    def __get_doi(self, paper):
        if paper["doi"]:
            return paper["doi"]

        if (
            paper["primary_location"]
            and paper["primary_location"]["landing_page_url"]
            and "doi.org" in paper["primary_location"]["landing_page_url"]
        ):
            return paper["primary_location"]["landing_page_url"]

        if (
            paper["primary_location"]
            and paper["primary_location"]["pdf_url"]
            and "doi.org" in paper["primary_location"]["pdf_url"]
        ):
            return paper["primary_location"]["pdf_url"]

        return ""

    def __get_hosted_location(self, paper):
        if paper["primary_location"] and paper["primary_location"]["source"]:
            return paper["primary_location"]["source"]["display_name"]
        return ""

    def __get_hosted_location_type(self, paper):
        if paper["primary_location"] and paper["primary_location"]["source"]:
            return paper["primary_location"]["source"]["type"]
        return ""

    def __get_hosted_location_id(self, paper):
        if paper["primary_location"] and paper["primary_location"]["source"]:
            return paper["primary_location"]["source"]["id"]
        return ""

    def process_results(self, pager, page=1):
        """returns number of pages available"""
        papers = []

        results = pager.get(return_meta=True, per_page=self.__page_size, page=page)

        papers = results[0]

        self.papers = papers
        return math.ceil(results[1]["count"] / 200)

    def to_dataframe(self) -> pd.DataFrame:
        return pd.DataFrame(
            [
                {
                    "entry": paper["id"],
                    "authors": self.__get_author_names(paper),
                    "author_ids": self.__get_author_ids(paper),
                    "author_institutions": self.__get_institutions(paper),
                    "author_countries": self.__get_institution_countries(paper),
                    "institution_types": self.__get_institution_types(paper),
                    "institution_ids": self.__get_institution_ids(paper),
                    "concepts_lv_1": self.__get_concepts(paper, "display_name", 1),
                    "concepts_lv_2": self.__get_concepts(paper, "display_name", 2),
                    "concepts_lv_3": self.__get_concepts(paper, "display_name", 3),
                    "concepts_lv_1_ids": self.__get_concepts(paper, "id", 1),
                    "concepts_lv_2_ids": self.__get_concepts(paper, "id", 2),
                    "concepts_lv_3_ids": self.__get_concepts(paper, "id", 3),
                    "citation_counts": paper["cited_by_count"],
                    "title": paper["title"],
                    "doi": self.__get_doi(paper),
                    "publication_year": paper["publication_year"],
                    "hosted_location": self.__get_hosted_location(paper),
                    "hosted_location_type": self.__get_hosted_location_type(paper),
                    "hosted_location_id": self.__get_hosted_location_id(paper),
                }
                for paper in self.papers
            ]
        )
