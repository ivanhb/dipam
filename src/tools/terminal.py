
class Terminal(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    def bar_chart(self, input_files, param):
        data_to_return = {"data":{}}

        #Build data here

        return data_to_return

    def save_file(self, input_files, input_file_names, param):
        data_to_return = {"data":{}}

        # NO RESTRICTIONS  Takes any input

        print("Saving files ...")

        #Build data here
        res_docs = {}
        i = 0
        for a_data_value in input_files:
            res_docs[a_data_value] = {}
            for f_i in range(0,len(input_files[a_data_value])):
                a_doc = input_files[a_data_value][f_i]
                a_doc_name = input_file_names[a_data_value][f_i]
                res_docs[a_data_value][a_doc_name] = a_doc

        data_to_return["data"] = res_docs
        return data_to_return
