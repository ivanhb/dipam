
import os
import json
from shutil import copyfile

class Data(object):

    def __init__(self):
        self.process_dir = ".process-temp/"
        self.index = {}

    def index_new_data(self, node, param):
        id = node['id']
        self.index[id] = {}
        self.index[id]['file'] = []
        self.index[id]['class'] = node['class']

        #create the index for the internal files
        files = None;
        if 'p-file[]' in param:
            files = param['p-file[]']

        self.index[id]['file'] = files

        return 1

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
        except:
            return -1
    #create an index for the internal files
    def __create_index(self, dir, data_id, files):
        index = {}
        index[data_id] = files
        with open(str(dir)+'/index.json', 'w') as f:
            json.dump(index, f)

    def __text_file(self, files, dir):
        for f in files:
            copyfile(f, dir+"/"+f.name+".txt")

    def __table_file(self):
        for f in files:
            copyfile(f, dir+"/"+f.name+".csv")
