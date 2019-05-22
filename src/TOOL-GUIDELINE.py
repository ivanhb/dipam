
class TOOL_NAME(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    def FUN_NAME(self, input_files, param):
        data_to_return = {"data":{}}

        #Build your data here
        #The returned data must include a recognizable key and the data associated to it
        # e.g: data_to_return
        # {
        #    "d-gen-text": {"0": "HI","1":"BYE" ...}
        #   ...
        # }

        return data_to_return
