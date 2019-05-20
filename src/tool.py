from src.textAnalysis import TextAnalysis

class Tool(object):

    def __init__(self):
        self.TOOL_HANDLER = 'TextAnalysis'
        text_handler = TextAnalysis()
        pass

    # Run a method from the TOOL_HANDLER module
    # <node>: The corresponding node
    # <temp_dir>: the temporal processing directory path
    # <param>: in case of additional parameters for the method called
    def run(self, node, temp_dir, param = None):
        method = node['class']
        input_data = node['input']
        output_data = node['output']

        #The corresponding function must return a set of files for each different output_data entry
        res = getattr(self.TOOL_HANDLER, method)(input_data, output_data, param)

        #Files to write on <temp_dir>

        #Files to include inside the index as new entries
        #return this to main.py

        return res
