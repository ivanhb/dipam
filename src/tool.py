from src import textAnalysis
from src import terminal

class Tool(object):

    def __init__(self):
        #self.BASE_PATH = base_path
        #initialize all the modules that handle the tool elements
        self.TOOL_HANDLER = textAnalysis.TextAnalysis(["t-topic-lda","t-filter-names"])
        self.TERMINAL_HANDLER = terminal.Terminal(["t-chart-bar","t-save-files"])


    # Run a method from the TOOL_HANDLER module
    # <node>: The corresponding node
    # <temp_dir>: the temporal processing directory path
    # <param>: in case of additional parameters for the method called
    def run(self, n_data, n_workflow, n_graph, input_files, param = None):
        elem_id = n_data['id']
        elem_value = n_data['value']
        method = n_workflow['class']
        output_data = n_workflow['output']

        res = None
        if self.TOOL_HANDLER.is_handled(elem_value):
            res = getattr(self.TOOL_HANDLER, method)(input_files, param)
        elif self.TERMINAL_HANDLER.is_handled(elem_value):
            res = getattr(self.TERMINAL_HANDLER, method)(input_files, param)

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
