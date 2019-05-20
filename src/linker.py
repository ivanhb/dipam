
import os
import json
from shutil import copyfile

class Linker(object):

    def __init__(self):
        self.process_dir = "src/.process-temp/"
        self.index = {}

    def get_index(self, id):
        print("The index: ", self.index)
        if id not in self.index:
            return self.index[id]
        else:
            return -1

    def index_elem(self, id, copy_data = False):
        if id not in self.index:
            self.index[id] = {}
            self.index[id]['path'] = None
            if copy_data:
                process_dir = self.__create_process_dir(id)
                self.index[id]['path'] = process_dir
        return self.index[id]

    def add_entry(self, id, entry):

        an_index = self.index[id]

        #add a value to the entry
        n_value = entry['value']
        an_index[n_value] = {}

        an_index[n_value]['files'] = entry["files"]
        #check if files should be copied
        if an_index["path"] != None:
            __copy_files(entry["files"], an_index["path"])

        #add the corresponding class value of such data
        an_index[n_value]['class'] = entry["class"]

        return an_index[n_value]

    def build_data_entry(self, node):
        new_entry = {}
        #the value
        new_entry['value'] = node["value"]

        #add the corresponding files
        files = None;
        if 'p-file[]' in node["param"]:
            files = node["param"]['p-file[]']
        new_entry['files'] = files

        #the class
        new_entry['class'] = node["class"]

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
