
class Terminal(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    def bar_chart(self, input_files, param):
        data_to_return = {"data":{}}

        #Build data here

        return data_to_return
