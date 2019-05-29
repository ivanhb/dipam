
class Filter(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    def filter_text(self, input_files, param):
        data_to_return = {"data":{}}

        # Check Restrictions
        if "d-gen-text" in input_files:
            ok_to_process = True

        print("Filter text ...")

        # Check the given param
        f_macro = []
        f_regex = ""
        if param != None:
            if "p-topic" in param:
            if "p-numwords" in param:


        return data_to_return
