
class Data(object):

    def __init__(self):
        # All the type of data in their corresponding data-class
        self.data_index = {}
        #self.data_index["d-gen-text"] = "text"
        #self.data_index["d-gen-table"] = "table"

    def set_data_index(self, data_config):
        for k_data in data_config:
            self.data_index[k_data] = {}
            self.data_index[k_data]['data_class'] = data_config[k_data]["data_class"]
            self.data_index[k_data]['file_name'] = data_config[k_data]["file_name"]

    def handle(self, files_list, data_value, file_type = "file"):
        list_text = []
        list_text_name = []
        data_class = None
        if data_value in self.data_index:
            data_class = self.data_index[data_value]['data_class']
            file_name = self.data_index[data_value]['file_name']
            if files_list:
                f_id = 0
                for a_file in files_list:

                    a_doc = self.read_input(a_file, file_type)

                    #list_text_name.append()
                    list_text_name.append(file_name+"_"+str(f_id))
                    if data_class == 'text':
                        list_text.append(self.process_text(a_doc))
                    elif data_class == 'table':
                        list_text.append(self.process_table(a_doc))

                    f_id += 1

        return (list_text,list_text_name)

    def read_input(self,a_file, file_type):
        res = None
        if file_type == "path":
            a_f = open(a_file,"r", encoding='utf-8', errors='ignore')
            res = a_f.read()
            a_f.close()
        elif file_type == "file":
            res = str(a_file.read(),'utf-8',errors='ignore')
        else:
            res = a_file
        return res

    def process_text(self,an_input):
        return an_input

    def process_table(self,an_input):
        return an_input
