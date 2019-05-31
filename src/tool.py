from src.tools import textAnalysis
from src.tools import terminal
from src.tools import filter

class Tool(object):

    def __init__(self):
        #self.BASE_PATH = base_path
        #initialize all the modules that handle the tool elements
        self.TOOL_HANDLER = textAnalysis.TextAnalysis(["t-topic-lda","t-filter-names"])
        self.TERMINAL_HANDLER = terminal.Terminal(["t-chart-bar","t-save-files"])
        self.FILTER_HANDLER = filter.Filter(["t-filter-text"])


    # Run a method from the TOOL_HANDLER module
    # <node>: The corresponding node
    # <temp_dir>: the temporal processing directory path
    # <param>: in case of additional parameters for the method called
    def run(self, n_data, n_workflow, n_graph, input_files, input_file_names, param = None):
        elem_id = n_data['id']
        elem_value = n_data['value']
        method = n_workflow['class']
        output_data = n_workflow['output']

        res = None
        if self.TOOL_HANDLER.is_handled(elem_value):
            print("Text tool running ...")
            res = getattr(self.TOOL_HANDLER, method)(input_files, input_file_names, param)
        elif self.TERMINAL_HANDLER.is_handled(elem_value):
            print("Terminal tool running ...")
            res = getattr(self.TERMINAL_HANDLER, method)(input_files, input_file_names, param)
        elif self.FILTER_HANDLER.is_handled(elem_value):
            print("Filtering tool running ...")
            res = getattr(self.FILTER_HANDLER, method)(input_files, input_file_names, param)

        #The corresponding function must return a set of files for each different output_data entry
        # <res> example:
        #res = {
        #        "data": {
        #                "d-gen-text": {
        #                    "1.txt" : "hi",
        #                    "2.txt" : "bye"
        #                }
        #        }
        #}

        #print("Tool:",elem_id," With input files:",len(input_files)," Returned: ",res)

        data_entries = []
        if res != None:
            if "data" in res:
                for k_data in res["data"]:
                    an_entry = {}
                    an_entry[k_data] = {}

                    for key, value in res["data"][k_data].items():
                        f_name = key
                        f_inner_value = value
                        #self.write_file(self.BASE_PATH+"/"+str(elem_id)+"/"+str(f_name), f_inner_value)
                        #an_entry[k_data]["files"].append(f_name)
                        an_entry[k_data][f_name] = f_inner_value

                        data_entries.append(an_entry)

        #return this to main.py
        return data_entries
