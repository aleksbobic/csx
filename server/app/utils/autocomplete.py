import spacy
import pytextrank
import marisa_trie
import os

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
    completion_trie = marisa_trie.Trie(completion_phrases)

    if not os.path.exists("./app/data/autocomplete"):
        os.makedirs("./app/data/autocomplete")

    completion_trie.save(f"./app/data/autocomplete/auto_{index}_{feature}")


def get_suggestions(index, feature, input):
    completion_trie = marisa_trie.Trie()
    completion_trie.load(f"./app/data/autocomplete/auto_{index}_{feature}")
    return completion_trie.keys(input)[:20]
