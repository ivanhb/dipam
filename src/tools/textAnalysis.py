import numpy as np
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import string
# Importing Gensim
import gensim
from gensim import corpora
from gensim.models.coherencemodel import CoherenceModel

class TextAnalysis(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    # Each tool defined here must respect the configuration attributes given in the config file
    # the returned output must be same as these defined in the [output] key for the corresponding method
    def lda(self, input_files, input_file_names, param):

        data_to_return = {"data":{}}
        ok_to_process = False
        #Check the MUST Prerequisite
        # Check Restrictions
        if "d-gen-text" in input_files:
            if len(input_files["d-gen-text"]):
                ok_to_process = True

        if not ok_to_process:
            res_err = {"data":{}}
            res_err["data"]["error"] = {}
            res_err["data"]["error"]["ValueError"] = "Input data missing!"
            return res_err

        #The params
        p_num_topics = 5
        p_num_words = None
        p_stopwords = None
        if param != None:
            if "p-topic" in param:
                p_num_topics = int(param["p-topic"])
            if "p-numwords" in param:
                p_num_words = int(param["p-numwords"])
            if "p-defstopwords" in param:
                p_stopwords = str(param["p-defstopwords"])


        #Define the set of documents
        documents = []
        for a_file_value in input_files["d-gen-text"]:
            #iterate through the array of values given
            documents.append(a_file_value)


        def clean(doc, p_stopwords, d_stopwords):
            stop = set()
            if p_stopwords != "none":
                stop = set(stopwords.words(p_stopwords))
                stop.union(d_stopwords)
            stop_free = " ".join([i for i in doc.lower().split() if i not in stop])
            exclude = set(string.punctuation)
            punc_free = ''.join(ch for ch in stop_free if ch not in exclude)
            lemma = WordNetLemmatizer()
            normalized = " ".join(lemma.lemmatize(word) for word in punc_free.split())
            return normalized

        def read_stopwords_data(list_data):
            res = []
            for a_tab in list_data:
                for row in a_tab:
                    res.append(row[0])
            return res

        stopwords_data = set()
        if "d-stopwords" in input_files:
            if len(input_files["d-stopwords"]):
                stopwords_data = set(read_stopwords_data(input_files["d-stopwords"]))

        doc_clean = [clean(str(doc), p_stopwords, stopwords_data).split() for doc in documents]


        # Creating the term dictionary of our courpus, where every unique term is assigned an index.
        dictionary = corpora.Dictionary(doc_clean)

        # Converting list of documents (corpus) into Document Term Matrix using dictionary prepared above.
        doc_term_matrix = [dictionary.doc2bow(doc) for doc in doc_clean]


        # Creating the object for LDA model using gensim library
        Lda = gensim.models.ldamodel.LdaModel

        # Running and Trainign LDA model on the document term matrix.
        try:
            ldamodel = Lda(doc_term_matrix, num_topics= p_num_topics, id2word = dictionary, passes=50)
        except ValueError:
            res_err = {"data":{}}
            res_err["data"]["error"] = {}
            res_err["data"]["error"]["ValueError"] = "Incompatible data have been given as input to the LDA algorithm"
            return res_err

        res = ldamodel.print_topics(num_topics= p_num_topics, num_words= p_num_words)
        # Get the Coherence value
        cm = CoherenceModel(model=ldamodel, corpus=doc_term_matrix, coherence='u_mass')
        coherence = cm.get_coherence()

        # populate the files according to the topics found
        a_tab = [["topic","word","score"]]
        for topic_i in res:
            # 0: is id, 1: str of all words
            t_id = topic_i[0]
            t_words_str = topic_i[1]
            t_words = t_words_str.split(" + ")
            for a_t_word in t_words:
                a_t_word_parts = a_t_word.split("*")
                score = a_t_word_parts[0]
                the_word = a_t_word_parts[1].replace('"','')
                a_tab.append([t_id,the_word,score])

        #numpy.savetxt("foo.csv", numpy.asarray(a_tab), delimiter=",")
        res_csvs = {}
        res_csvs["topics.csv"] = a_tab
        res_coherence = {}
        res_coherence["coherence.txt"] = str(coherence)

        #The returned data must include a recognizable key and the data associated to it
        data_to_return["data"]["d-topics-table"] = res_csvs
        data_to_return["data"]["d-coherence"] = res_coherence
        return data_to_return
