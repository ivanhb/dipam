import numpy as np
import pandas as pd

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

        #The returned data must include a recognizable key and the data associated to it
        data_to_return["data"]["d-gen-text"] = {"0": str(documents[0])}
        return data_to_return
