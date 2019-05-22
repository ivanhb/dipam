
class Terminal(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    def bar_chart(self, input_files, param):
        data_to_return = {"data":{}}

        #Build data here

        return data_to_return

    def save_file(self, input_files, param):
        data_to_return = {"data":{}}

        # NO RESTRICTIONS  Takes any input

        print("Saving files ...")

        #Build data here
        res_docs = {}
        i = 0
        for a_data_value in input_files:
            res_docs[a_data_value] = {}
            if a_data_value == "d-gen-text":
                extension = ".txt"
            elif a_data_value == "d-gen-table":
                extension = ".csv"

            for a_doc in input_files[a_data_value]:
                res_docs[a_data_value][str(i)+extension] = a_doc
                i += 1


        data_to_return["data"] = res_docs
        return data_to_return
