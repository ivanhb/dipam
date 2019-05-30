
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

    def handle(self, files_list, data_value, file_path = False):
        list_text = []
        list_text_name = []
        data_class = None
        if data_value in self.data_index:
            data_class = self.data_index[data_value]['data_class']
            file_name = self.data_index[data_value]['file_name']
            if files_list:
                f_id = 0
                for a_file in files_list:

                    #open the file to read
                    if file_path:
                        a_file = open(a_file,"r", encoding='utf-8', errors='ignore')

                    #list_text_name.append()
                    list_text_name.append(file_name+"_"+str(f_id))
                    if data_class == 'text':
                        list_text.append(self.process_text(a_file))
                    elif data_class == 'table':
                        list_text.append(self.process_table(a_file))

                    #close the file
                    if file_path:
                        a_file.close()

                    f_id += 1

        print("Documents are:",list_text)
        return (list_text,list_text_name)

    def process_text(self,a_file):
        return str(a_file.read(),'utf-8',errors='ignore')

    def process_table(self,a_file):
        return a_file.read()
