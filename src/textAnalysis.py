import numpy as np
import pandas as pd
import os
import codecs

class TextAnalysis(object):


    def __init__(self):
        #the type of outputs possible
        self.OUTPUT_DATA_TYPE = ['d-gen-table', 'd-gen-text']

    def lda(self, input_files, param):

        #Define the set of documents
        documents = []
        for f in input_files:
            documents.append(self.read_a_file(f))

        print(documents[0])

        #The returned data must include a recognizable key and the data associated to it
        data_to_return = {
            "d-gen-text": {
                "data": documents
            }
        }
        return data_to_return

    def read_a_file(self, file_full_path):
        with codecs.open(file_full_path, 'r', encoding='utf-8',errors='ignore') as f:
            return f.read()
