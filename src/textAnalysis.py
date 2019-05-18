import numpy as np
import pandas as pd
import os
import codecs

class TextAnalysis(object):


    def __init__(self):
        pass

    def lda(self, files, param):

        #Define the set of documents
        documents = []
        for f in files:
            documents.append(read_a_file(f))

        pass

    def read_a_file(file_full_path):
        with codecs.open(file_full_path, 'r', encoding='utf-8',errors='ignore') as f:
            return f.read()
