import numpy as np
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import string
# Importing Gensim
import gensim
from gensim import corpora

class TextAnalysis(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    # Each tool defined here must respect the configuration attributes given in the config file
    # the returned output must be same as these defined in the [output] key for the corresponding method
    def lda(self, input_files, param):

        data_to_return = {"data":{}}
        ok_to_process = False
        #Check the MUST Prerequisite
        if "d-gen-text" in input_files:
            ok_to_process = True

        #Define the set of documents
        documents = []
        for a_file_value in input_files["d-gen-text"]:
            #iterate through the array of values given
            documents.append(a_file_value)

        print("LDA Topic Modelling on "+str(len(documents))+ " documents.")

        stop = set(stopwords.words('english'))
        exclude = set(string.punctuation)
        lemma = WordNetLemmatizer()

        def clean(doc):
            stop_free = " ".join([i for i in doc.lower().split() if i not in stop])
            punc_free = ''.join(ch for ch in stop_free if ch not in exclude)
            normalized = " ".join(lemma.lemmatize(word) for word in punc_free.split())
            return normalized

        doc_clean = [clean(str(doc)).split() for doc in documents]


        # Creating the term dictionary of our courpus, where every unique term is assigned an index.
        dictionary = corpora.Dictionary(doc_clean)

        # Converting list of documents (corpus) into Document Term Matrix using dictionary prepared above.
        doc_term_matrix = [dictionary.doc2bow(doc) for doc in doc_clean]


        # Creating the object for LDA model using gensim library
        Lda = gensim.models.ldamodel.LdaModel

        # Running and Trainign LDA model on the document term matrix.
        ldamodel = Lda(doc_term_matrix, num_topics=3, id2word = dictionary, passes=50)


        res_docs = {}
        res_docs["3topics.txt"] = str(ldamodel.print_topics(num_topics=3, num_words=10))


        #The returned data must include a recognizable key and the data associated to it
        data_to_return["data"]["d-gen-text"] = res_docs
        return data_to_return
