from pyalex import Authors, Concepts, Institutions, Sources


class OpenAlexHelper:
    def __get_concept_ids(self, concept_name):
        return Concepts().search(concept_name).select(["id"]).paginate(per_page=50)

    def __get_source_ids(self, source_name):
        return Sources().search(source_name).select(["id"]).paginate(per_page=50)

    def __get_institution_ids(self, institution_name):
        return (
            Institutions().search(institution_name).select(["id"]).paginate(per_page=50)
        )

    def __get_author_ids(self, name=None):
        return Authors().search(name).select(["id"]).paginate(per_page=50)

    def __get_clean_id(self, entry):
        return entry["id"].replace("https://openalex.org/", "")

    def get_ids(self, entity, entity_name):
        pager = None

        if entity == "concept":
            pager = self.__get_concept_ids(entity_name)
        if entity == "source":
            pager = self.__get_source_ids(entity_name)
        if entity == "institution":
            pager = self.__get_institution_ids(entity_name)
        if entity == "author":
            pager = self.__get_author_ids(entity_name)

        if not pager:
            return []

        entry_list = []
        for page in pager:
            if len(entry_list) >= 50:
                break
            entry_list += page

        return [self.__get_clean_id(entry) for entry in entry_list]
