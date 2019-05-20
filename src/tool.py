from src import textAnalysis
from werkzeug.datastructures import FileStorage

class Tool(object):

    def __init__(self):
        self.TOOL_HANDLER = textAnalysis.TextAnalysis()

    # Run a method from the TOOL_HANDLER module
    # <node>: The corresponding node
    # <temp_dir>: the temporal processing directory path
    # <param>: in case of additional parameters for the method called
    def run(self, node, temp_dir, input_files = None, param = None):
        method = node['class']
        #input_data = node['input[]']
        output_data = node['output[]']

        #The corresponding function must return a set of files for each different output_data entry
        res = getattr(self.TOOL_HANDLER, method)(input_files)

        print(res)

        data_entries = []
        #Files to write on <temp_dir>
        for k_data in res["data"]:
            an_entry = {}
            an_entry[k_data] = {'files': []}
            #read each file in write it
            if "data" in an_entry[k_data]:

                for key, value in an_entry[k_data]["data"].items():
                    f_name = key
                    f_value = value
                    f_pointer = self.write_file(str(temp_dir)+str(f_name), f_value)

                    an_entry[k_data].append(f_pointer)

            data_entries.append(an_entry)

        #return this to main.py
        return data_entries


    def write_file(self, path, file_value):
        with open(path, 'w') as d_file:
            file = FileStorage(d_file)
            d_file.write(file_value)
            return file
