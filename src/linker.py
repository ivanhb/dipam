
import os
import json
from shutil import copyfile

class Linker(object):

    def __init__(self):
        self.process_dir = "src/.process-temp/"
        self.index = {}

    def get_elem(self, id):
        if id in self.index:
            return self.index[id]
        else:
            return -1

    def index_elem(self, id):
        if id not in self.index:
            self.index[id] = {}
            self.__create_process_dir(id)
        return self.index[id]

    def add_entry(self, id, entry):

        if id in self.index:
            d_value = next(iter(entry.items()))[0]
            self.index[id][d_value] = entry[d_value]

        return self.index[id]

    def build_data_entry(self, node):
        new_entry = {}
        #the value
        new_entry[node["value"]] = {}

        #add the corresponding files
        files = None;
        if 'p-file[]' in node["param"]:
            files = node["param"]['p-file[]']
        new_entry[node["value"]]['files'] = files
        #the class
        new_entry[node["value"]]['class'] = node["class"]

        return new_entry


    def get_data(self, id):
        if id in self.index:
            return self.index[id]['file']
        else:
            return -1

    #dir should be like the node id
    def __create_process_dir(self, dir_id):
        new_dir = self.process_dir+str(dir_id)
        try:
            os.mkdir(new_dir)
            return self.process_dir+str(dir_id)
        except FileExistsError:
            return self.process_dir+str(dir_id)

    #create an index for the internal files
    def __dump_index(self, dir, data_id, files):
        index = {}
        index[data_id] = files
        with open(str(dir)+'/index.json', 'w') as f:
            json.dump(index, f)

    def __copy_files(self, files, dir, type):
        if type == 'text':
            self.__text_file(files, dir)
        elif type == 'table':
            self.__text_file(files, dir)

    def __text_file(self, files, dir):
        for f in files:
            copyfile(f, dir+"/"+f.name+".txt")

    def __table_file(self):
        for f in files:
            copyfile(f, dir+"/"+f.name+".csv")