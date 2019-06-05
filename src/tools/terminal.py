#import numpy as np
#import matplotlib.pyplot as plt

class Terminal(object):

    def __init__(self):
        pass

    def doc_topics_barchart(self, input_files, param):
        data_to_return = {"data":{}}

        ok_to_process = False
        #Check the MUST Prerequisite
        # Check Restrictions
        if "d-doc-topics" in input_files:
            if len(input_files["d-doc-topics"]):
                ok_to_process = True

        if not ok_to_process:
            res_err = {"data":{}}
            res_err["data"]["error"] = "Input data missing!"
            return res_err

        documents = {}
        data_to_return["data"]["d-doc-topics"] = {}
        return data_to_return

    def save_file(self, input_files, param):
        data_to_return = {"data":{}}

        # NO RESTRICTIONS  Takes any input

        #Build data here
        res_docs = {}
        for a_data_value in input_files:
            res_docs[a_data_value] = {}
            for file_k in input_files[a_data_value]:
                res_docs[a_data_value][file_k] = input_files[a_data_value][file_k]

        data_to_return["data"] = res_docs
        return data_to_return
