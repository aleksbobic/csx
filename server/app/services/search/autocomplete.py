import itertools
import os
from typing import List

import marisa_trie
import pandas as pd
import polars as pl
import pytextrank
import spacy

nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("textrank")
stopwords = nlp.Defaults.stop_words


def remove_stopwords(phrase) -> str:
    """remove stopwords from spacy phrase"""
    return " ".join(
        [entry for entry in phrase.text.lower().split(" ") if entry not in stopwords]
    )


def generate_auto_index(index: str, feature: str, strings: List[str]) -> None:
    """Generate autocomplete index of one feature"""
    completion_phrases = []

    for doc in nlp.pipe(strings):
        completion_phrases += [remove_stopwords(phrase) for phrase in doc._.phrases]

    completion_phrases = list(set(completion_phrases))
    completion_phrases = [phrase.lower() for phrase in completion_phrases]
    completion_trie = marisa_trie.Trie(completion_phrases)

    if not os.path.exists("./app/data/autocomplete"):
        os.makedirs("./app/data/autocomplete")

    completion_trie.save(f"./app/data/autocomplete/auto_{index}_{feature}")


def generate_list_auto_index(index, feature, completion_phrases):
    completion_phrases = [phrase.lower() for phrase in completion_phrases]
    completion_trie = marisa_trie.Trie(completion_phrases)

    if not os.path.exists("./app/data/autocomplete"):
        os.makedirs("./app/data/autocomplete")

    completion_trie.save(f"./app/data/autocomplete/auto_{index}_{feature}")


def generate_main_auto_index(
    index: str,
    other_search_fields: List[str],
    string_search_fields: List[str],
    data: pl.DataFrame,
) -> None:
    """Generate index consisting of multiple features"""

    dataset = data.to_pandas()
    string_values = []

    for prop in string_search_fields:
        string_values += dataset[prop].astype(str).to_list()

    completion_phrases = []

    for doc in nlp.pipe(string_values):
        completion_phrases += [remove_stopwords(phrase) for phrase in doc._.phrases]

    completion_phrases += list(
        itertools.chain.from_iterable(
            dataset[other_search_fields].astype(str).values.tolist()
        )
    )

    completion_phrases = list(set(completion_phrases))

    completion_phrases = [phrase.lower() for phrase in completion_phrases]

    completion_trie = marisa_trie.Trie(completion_phrases)
    if not os.path.exists("./app/data/autocomplete"):
        os.makedirs("./app/data/autocomplete")

    completion_trie.save(f"./app/data/autocomplete/auto_{index}")


def get_suggestions(index: str, input: str, feature: str = ""):
    """Retrieve top 20 suggestions based on given input and index"""
    completion_trie = marisa_trie.Trie()

    if not os.path.exists(f"./app/data/autocomplete/auto_{index}_{feature}"):
        return [input]

    if feature != "":
        completion_trie.load(f"./app/data/autocomplete/auto_{index}_{feature}")
    else:
        completion_trie.load(f"./app/data/autocomplete/auto_{index}")

    return [input] + completion_trie.keys(input.lower())[:20]
