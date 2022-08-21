import spacy
import pytextrank
import marisa_trie
import os
import itertools

nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("textrank")
stopwords = nlp.Defaults.stop_words


def process_phrase(phrase):
    return " ".join(
        [entry for entry in phrase.text.lower().split(" ") if entry not in stopwords]
    )


def generate_auto_index(index, feature, strings):
    completion_phrases = []

    for doc in nlp.pipe(strings):
        completion_phrases += [process_phrase(phrase) for phrase in doc._.phrases]

    completion_phrases = list(set(completion_phrases))
    completion_phrases = [phrase.lower() for phrase in completion_phrases]
    completion_trie = marisa_trie.Trie(completion_phrases)

    if not os.path.exists("./app/data/autocomplete"):
        os.makedirs("./app/data/autocomplete")

    completion_trie.save(f"./app/data/autocomplete/auto_{index}_{feature}")


def generate_main_auto_index(index, other_search_fields, string_search_fields, data):

    string_values = []

    for prop in string_search_fields:
        string_values += data[prop].astype(str).to_list()

    completion_phrases = []

    for doc in nlp.pipe(string_values):
        completion_phrases += [process_phrase(phrase) for phrase in doc._.phrases]

    completion_phrases += list(
        itertools.chain.from_iterable(
            data[other_search_fields].astype(str).values.tolist()
        )
    )

    completion_phrases = list(set(completion_phrases))

    completion_phrases = [phrase.lower() for phrase in completion_phrases]

    completion_trie = marisa_trie.Trie(completion_phrases)
    if not os.path.exists("./app/data/autocomplete"):
        os.makedirs("./app/data/autocomplete")

    completion_trie.save(f"./app/data/autocomplete/auto_{index}")


def get_suggestions(index, input, feature=""):
    completion_trie = marisa_trie.Trie()

    if feature != "":
        completion_trie.load(f"./app/data/autocomplete/auto_{index}_{feature}")
    else:
        completion_trie.load(f"./app/data/autocomplete/auto_{index}")
    return completion_trie.keys(input.lower())[:20]
